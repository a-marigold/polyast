import { SKIP, STOP } from './constants';
import type { NodeBase, NodeParentLike, OnEnter, OnExit } from './types';

/**
 *
 *
 *
 *
 * #### Traverses `node` iterativly.
 * #### Can traverse any AST that has nodes with `type` property.
 *
 * `onEnter` and `onExit` can return a new node to replace the current node
 *
 * or {@link STOP} to immediatly stop traversal.
 *
 * @template N Type of possible Node that can appear in AST.
 * @param node Root node to be traversed.
 * @param onEnter Can return {@link SKIP} not to traverse the current node.
 * @param onExit Сalled only after all node's children are traversed.
 *   Must NOT return {@link SKIP} because it can cause unexpected behaviour.
 */

export const traverse = <N extends NodeBase>(
	node: N,
	onEnter: OnEnter<N, N | N[] | undefined> | null,
	onExit: OnExit<N, N | N[] | undefined> | null,
): void => {
	/**
	 *
	 * `0` means calling `onEnter`.
	 *
	 * `1` means calling `onExit`.
	 *
	 */

	type NodeState = 0 | 1;

	/**
	 *
	 * `nodeStack` is a flat array for better performance.
	 *
	 * It has significant order which must be supported:
	 *
	 * ```typescript
	 * nodeStack.pop(); // `NodeState`
	 * nodeStack.pop(); //   Key
	 * nodeStack.pop(); // Parent | Undefined
	 * nodeStack.pop(); // Node
	 *
	 * nodeStack.push(Node, Parent, Key, NodeState);
	 * ```
	 */
	const nodeStack: (N | NodeParentLike | undefined | string | NodeState)[] = [
		node,
		undefined,
		'',
		0,
	];

	while (nodeStack.length) {
		// Assertions are not dangeruous - see the description of `nodeStack`
		const nodeState = nodeStack.pop() as NodeState;
		const key = nodeStack.pop() as string;
		const parent = nodeStack.pop() as NodeParentLike | undefined;
		let node = nodeStack.pop() as N;

		if (nodeState) {
			// Assertion is not dangerous 'cause `nodeState` is not truthy if `onExit` is not provided.
			const exitResult = (onExit as OnExit<N, NodeParentLike | undefined>)(
				node,
				parent,
				key,
			);

			if (exitResult) {
				if (exitResult === STOP) {
					return;
				}

				if (parent) {
					(parent as Record<string, unknown>)[key] = exitResult;
				}
			}
		} else {
			if (onEnter) {
				const enterResult = onEnter(node, parent, key);

				if (enterResult) {
					if (enterResult === SKIP) {
						continue;
					}

					if (enterResult === STOP) {
						return;
					}

					if (parent) {
						(parent as Record<string, unknown>)[key] =
							enterResult;
						node = enterResult as N;
					}
				}
			}
			if (onExit) {
				nodeStack.push(node, parent, key, 1);
			}

			for (const nodeKey in node) {
				const property = (node as Record<string, unknown>)[nodeKey];

				if (typeof property === 'object' && property) {
					if ((property as NodeBase)?.type) {
						nodeStack.push(
							property as NodeBase,
							node,
							nodeKey,
							0,
						);
					} else if (Array.isArray(property)) {
						let propIndex = property.length - 1;

						while (propIndex >= 0) {
							nodeStack.push(
								property[propIndex],

								property as NodeParentLike,

								propIndex.toString(),
								0,
							);

							propIndex--;
						}
					}
				}
			}
		}
	}
};
