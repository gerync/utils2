import Coloredlog from '../functions/util/ColoredLog';

describe('Coloredlog', () => {
    it('does not throw for string message', () => {
        expect(() => Coloredlog('Test', 'red')).not.toThrow();
    });

    it('does not throw for array message', () => {
        expect(() => Coloredlog(['A', 'B'], ['red', 'blue'])).not.toThrow();
    });

    it('does not throw for bolded message', () => {
        expect(() => Coloredlog('Bold', 'green', true)).not.toThrow();
    });

    it('does not throw for hex color', () => {
        expect(() => Coloredlog('Hex', '#ff0000')).not.toThrow();
    });

    it('does not throw for named color', () => {
        expect(() => Coloredlog('Named', 'blue')).not.toThrow();
    });
});
