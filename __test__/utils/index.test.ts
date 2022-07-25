import { isValidId } from "../../src/lib/utils";

describe("isValidId", () => {
    test.each([
        ["false for empty id", "", false],
        ["false for null id", null, false],
        ["false for undefined id", undefined, false],
        ["false for invalid id", "123", false],
        ["false for id with invalid character", "llriqid2uq6ucvxpe2nta-hcb1", false],
        ["false for id with capital latter character", "Llriqid2uq6ucvxpe2nta-hcb1", false],
        ["true for valid id", "llriqid2uq6ucvxpe2nta4hcb1", true],
    ])(`should return %s`, (_, id, expected) => {
        expect(isValidId(id)).toEqual(expected);
    });
})

