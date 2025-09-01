import { Action, Key, actionIsDrop, actionForKey } from '../src/utils/Input';

describe('actionIsDrop', () => {
    it('returns true for drop actions', () => {
        expect(actionIsDrop(Action.SlowDrop)).toBe(true);
        expect(actionIsDrop(Action.FastDrop)).toBe(true);
    });
    it('returns false for non-drop actions', () => {
        expect(actionIsDrop(Action.Left)).toBe(false);
    });
});

describe('actionForKey', () => {
    it('returns correct action for key code', () => {
        expect(actionForKey('ArrowUp')).toBe(Action.Rotate);
        expect(actionForKey('KeyQ')).toBe(Action.Quit);
    });
    it('returns undefined for unknown key', () => {
        expect(actionForKey('Unknown')).toBeUndefined();
    });
});
