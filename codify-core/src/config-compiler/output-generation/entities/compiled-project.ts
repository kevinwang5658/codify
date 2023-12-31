import { RemoveMethods } from '../../../utils/types';
import { ProjectConfig } from '../../parser/entities/configs/project';
import { Applyable } from './index';

export class CompiledProject {
  applyableGraph!: Map<string, Applyable>;
  projectConfig!: ProjectConfig;

  constructor(props: RemoveMethods<CompiledProject>) {
    Object.assign(this, props);
  }

  getApplySequence(): Applyable[] {
    // In degree represents the number of incoming dependencies
    const inDegreeMap = this.initializeInDegreeMap();
    const queue: Applyable[] = [];
    const result: Applyable[] = [];

    console.log(this.applyableGraph);

    do {
      const independentNodeNames = this.findIndependentNodes(inDegreeMap);

      for (const name of independentNodeNames) {
        queue.push(this.applyableGraph.get(name)!);
        inDegreeMap.delete(name);
      }

      const removedNode = queue.shift();
      if (!removedNode) {
        throw new Error('Cycle detected. Unable to find a node with in-degree 0');
      }

      this.decrementInDegreeMap(removedNode, inDegreeMap);
      result.push(removedNode);
    } while (queue.length > 0 || this.findIndependentNodes(inDegreeMap).length > 0);

    console.log(result)

    if (result.length !== this.applyableGraph.size) {
      throw new Error('Cyclic dependency found');
    }

    return result.reverse();
  }

  private initializeInDegreeMap(): Map<string, number> {
    const inDegreeMap = new Map(
      [...this.applyableGraph.keys()].map((id) => [id, 0])
    );
    for (const applyable of this.applyableGraph.values()) {
      for (const dependentNode of applyable.dependencies) {
        const value = inDegreeMap.get(dependentNode.id)!;
        inDegreeMap.set(dependentNode.id, value + 1);
      }
    }

    return inDegreeMap;
  }

  private findIndependentNodes(map: Map<string, number>): string[] {
    const result = [];
    for (const [type, num] of map.entries()) {
      if (num === 0) {
        result.push(type);
      }
    }

    return result;
  }

  private decrementInDegreeMap(removedNode: Applyable, map: Map<string, number>) {
    for (const applyable of removedNode.dependencies) {
      const value = map.get(applyable.id)!;
      map.set(applyable.id, value - 1);
    }
  }
}
