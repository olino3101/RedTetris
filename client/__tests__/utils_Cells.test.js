import * as Cells from '../src/utils/Cells';
describe('Cells', () => {
    it('defaultCell and indestructibleCell are defined', () => {
        expect(Cells.defaultCell).toBeDefined();
        expect(Cells.indestructibleCell).toBeDefined();
    });
});
