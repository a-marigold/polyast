import type { SKIP, STOP } from './constants';

/**
 *
 *
 * Supertype of every AST node.
 */
export type NodeBase = {
	type: string;
};
/**
 *
 *
 *
 *
 * Supertype of every parent of an AST node.
 */
export type NodeParentLike = NodeBase | NodeBase[];

/**
 *
 *
 * Basic type of `onEnter`, `onExit`.
 */
export type Visitor<in N extends NodeBase, in P extends NodeParentLike | undefined, out R> = (
	node: N,
	parent: P,
	key: string,
) => R;

/**
 * `onEnter` parameter in `traverse` function.
 *
 * Can return {@link SKIP} to skip the current node or {@link STOP} to stop `traverse` function.
 */
export type OnEnter<N extends NodeBase, P extends NodeParentLike | undefined> = Visitor<
	N,
	P,
	NodeBase | typeof SKIP | typeof STOP | void | null
>;

/**
 *
 *
 * `onExit` parameter in `traverse` function.
 *
 * Can return {@link STOP} to stop `traverse` function.
 *
 *
 *
 *
 *
 */

export type OnExit<N extends NodeBase, P extends NodeParentLike | undefined> = Visitor<
	N,
	P,
	NodeBase | typeof STOP | void | null
>;
