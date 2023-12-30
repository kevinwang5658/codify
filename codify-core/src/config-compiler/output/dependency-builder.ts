import { ResourceConfig } from '../parser/entities/configs/resource';
import { ResourceNode } from './entities/resource-node';

export const DependencyBuilder = {

  /**
   * @param configs resource configs
   * @return a dependency graph in the form of an adjacency list
   */
  buildDependencyGraph(configs: ResourceConfig[]): ResourceNode[] {
    const resourceReferenceRegex = /\${([\w.]+)}/g

    // TODO: Support named resources in the future
    const nodeMap = new Map(configs.map((resource) =>
      [resource.id, { dependencies: [], id: resource.id, resource } as ResourceNode]
    ));

    for (const node of nodeMap.values()) {
      const referenceParameters = Object.entries(node.resource.parameters)
        .map(([name, value]) => [name, String(value), String(value).matchAll(resourceReferenceRegex)] as const)
        .filter(([, _, match]) => match)
        .flatMap(([name, _, matches]) =>
          [...matches].map(match => [name, match[1]] as const)
        );

      for (const [name, match] of referenceParameters) {
        const parts = match.split('.');
        if (parts.length < 2) {
          throw new Error(`Only resource parameter references are allowed. ${match}`);
        }

        if (!nodeMap.has(parts[0])) {
          throw new Error(`Unable to find resource being referenced. ${match}`);
        }

        // TODO: Support named resources in the future
        const referencedResource = nodeMap.get(parts[0])!;
        const referencedParameter = referencedResource.resource.parameters[parts[1]];

        if (!referencedParameter) {
          throw new Error(`Un-able to find parameter being referenced. ${match}`);
        }

        // TODO: Add recursive check for parameters of type parameter

        node.dependencies.push(referencedResource);

        // Substitute with actual value
        node.resource.parameters[name] = String(node.resource.parameters[name]).replace(`\${${match}}`, String(referencedParameter));
      }
    }

    return [...nodeMap.values()];
  },

  /**
   * Generate a list in the order that resources should be applied. Uses Kahn's algorithm (topological sort).
   * @param nodes resource nodes
   * @returns a prioritized list
   */
  generateDependencyList(nodes: ResourceNode[]): ResourceConfig[] {

    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    // In degree represents the number of incoming dependencies
    const inDegreeMap = initializeInDegreeMap();
    const queue: ResourceNode[] = [];
    const result: ResourceConfig[] = [];

    do {
      const nonDependentNodeNames = findNonDependentNodes(inDegreeMap);

      for (const name of nonDependentNodeNames) {
        queue.push(nodeMap.get(name)!);
        inDegreeMap.delete(name);
      }

      const removedNode = queue.shift();
      if (!removedNode) {
        throw new Error('Cycle detected. Unable to find a node with in-degree 0');
      }

      decrementInDegreeMap(removedNode, inDegreeMap);
      result.push(removedNode.resource);
    } while (queue.length > 0);

    if (result.length !== nodes.length) {
      throw new Error('Cyclic dependency found');
    }

    return result;

    function initializeInDegreeMap() {
      const inDegreeMap = new Map(nodes.map((node) => [node.id, 0]));
      for (const node of nodes) {
        for (const dependentNode of node.dependencies) {
          const value = inDegreeMap.get(dependentNode.id)!;
          inDegreeMap.set(dependentNode.id, value + 1);
        }
      }

      return inDegreeMap;
    }

    function findNonDependentNodes(map: Map<string, number>): string[] {
      const result = [];
      for (const [type, num] of map.entries()) {
        if (num === 0) {
          result.push(type);
        }
      }

      return result;
    }

    function decrementInDegreeMap(removedNode: ResourceNode, map: Map<string, number>) {
      for (const node of removedNode.dependencies) {
        const value = map.get(node.id)!;
        map.set(node.id, value - 1);
      }
    }
  }

}
