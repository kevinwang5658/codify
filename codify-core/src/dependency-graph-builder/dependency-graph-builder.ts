import { Project } from '../entities/project.js';

export const DependencyGraphBuilder = {

  /**
   * @return a dependency graph in the form of an adjacency list
   */
  buildDependencyGraph(project: Project) {
    const { resourceConfigs } = project;

    const resourceReferenceRegex = /\${([\w.]+)}/g

    // TODO: Support named resources in the future

    for (const config of resourceConfigs) {
      const referenceParameters = findParametersWithReferences(config.parameters)

      for (const [name, match] of referenceParameters) {
        const parts = match.split('.');
        if (parts.length < 2) {
          throw new Error(`Only resource parameter references are allowed. ${match}`);
        }

        const referencedId = findId(parts);
        if (!referencedId) {
          throw new Error(`Unable to find resource being referenced. ${match}`);
        }

        const referencedResource = applyableGraph.get(referencedId)
        if (!referencedResource) {
          throw new Error(`Unable to find resource being referenced. ${match}`);
        }

        const referencedParameterName = findParameterName(parts, referencedId);
        const referencedParameter = referencedResource.parameters.get(referencedParameterName);
        if (!referencedParameter) {
          throw new Error(`Un-able to find parameter being referenced. ${match}`);
        }

        // TODO: Add recursive check for parameters of type parameter

        config.dependencies.push(referencedResource);

        // Substitute with actual value
        config.parameters.set(name,
          String(config.parameters.get(name)).replace(`\${${match}}`, String(referencedParameter))
        );
      }
    }

    function findParametersWithReferences(parameters: Map<string, ResourceParameter>) {
      return [...parameters.entries()]
        .map(([name, value]) => [name, String(value), String(value).matchAll(resourceReferenceRegex)] as const)
        .filter(([, _, match]) => match)
        .flatMap(([name, _, matches]) =>
          [...matches].map(match => [name, match[1]] as const)
        );
    }

    function findId(parts: string[]): null | string {
      if (applyableGraph.has(parts[0])) {
        return parts[0];
      }

      if (applyableGraph.has(parts[0] + '.' + parts[1])) {
        return parts[0] + '.' + parts[1];
      }

      return null;
    }

    function findParameterName(parts: string[], id: string): string {
      return id.split('.').length === 1 ? parts[1] : parts[2];
    }
  },
}
