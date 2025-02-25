import { FullItem, GeneratorRecipe, ItemBuilder } from "../src";
import { FullItemAllOfFields } from "../src/model/fullItemAllOfFields";
import { isValidSectionId } from './../src/lib/utils';
import CategoryEnum = FullItem.CategoryEnum;

describe("Test ItemBuilder", () => {
    test("Create Item with minimum required fields", () => {
        const newItem = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .build();

        // Vault should not be defined
        expect(newItem.vault).toBeUndefined();

        // Item ID is set by server when not defined locally
        expect(newItem.id).toBeUndefined();

        expect(newItem instanceof FullItem).toBe(true);
    });

    test("Builder is reset after calling .build()", () => {
        const builder = new ItemBuilder();

        const firstItem = builder
            .setCategory(CategoryEnum.Custom)
            .setTitle("first")
            .build();

        const secondItem = builder
            .setCategory(CategoryEnum.Custom)
            .setTitle("second")
            .addTag("second")
            .build();

        expect(secondItem).not.toEqual(firstItem);
    });

    test("multiple url.primary assignments", () => {
        const newItem = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .addUrl({ href: "1password.com", primary: true })
            .addUrl({ href: "agilebits.com", primary: true })
            .build();

        const { urls } = newItem;
        expect(urls.length).toEqual(2);

        // Assert:
        //  - the **LAST** url to be set as "primary" is given that attribute
        //  - there is only 1 url with the `primary: true` attr
        let primaryUrls = 0;
        let primaryUrl;
        urls.forEach((url) => {
            if (url.primary) {
                primaryUrl = url.href;
                primaryUrls++;
            }
        });

        expect(primaryUrl).toEqual("agilebits.com");
        expect(primaryUrls).toEqual(1);
    });

    test("toggle item.favorite attribute", () => {
        // Never called => undefined
        const itemNotFavorite = new ItemBuilder()
            .setCategory(CategoryEnum.Custom)
            .build();

        expect(itemNotFavorite.favorite).toBeUndefined();

        // Toggle favorite => True
        const item = new ItemBuilder()
            .setCategory(CategoryEnum.Custom)
            .toggleFavorite()
            .build();
        expect(item.favorite).toEqual(true);

        // User called toggleFavorite twice, expect "True" to be toggled back to "False"
        const itemFavoriteCalledTwice = new ItemBuilder()
            .setCategory(CategoryEnum.Custom)
            .toggleFavorite()
            .toggleFavorite()
            .build();

        expect(itemFavoriteCalledTwice.favorite).toEqual(false);
    });

    test("set item category", () => {
        const builder = new ItemBuilder();

        // Invalid category -> ERROR
        expect(() => {
            builder.setCategory("invalid");
        }).toThrowError(TypeError);

        builder.setCategory(CategoryEnum.Login);
        const itemWithCategory = builder.build();

        expect(itemWithCategory.category).toEqual(CategoryEnum.Login);
    });

    test("sections have valid id", () => {
        const itemOneSection = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .addSection("section 1")
            .build();

        expect(itemOneSection.sections.length).toEqual(1);
        expect(isValidSectionId(itemOneSection.sections[0].id)).toBeTruthy();
    });

    test("sections have unique names", () => {
        // Case in-sensitive section names
        const itemOneSection = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .addSection("Section 1")
            .addSection("section 1")
            .build();
        expect(itemOneSection.sections.length).toEqual(1);
        // sections are collapsed into one if normalized names are equal
        expect(itemOneSection.sections[0].label).toEqual("Section 1");

        const itemUtf8Sections = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .addSection("🔐 Secure!")
            .addSection("🔐 Secure")
            .build();

        expect(itemUtf8Sections.sections.length).toEqual(1);
        // sections are collapsed into one if normalized names are equal
        expect(itemUtf8Sections.sections[0].label).toEqual("🔐 Secure!");

        const itemMultipleSections = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .addSection("It's a secret!")
            .addSection("Geheimnis")
            .build();

        expect(itemMultipleSections.sections.length).toEqual(2);
    });

    test("adding tags", () => {
        // 1Password does not normalize tags
        const caseInsensitiveTags = ["myTag", "mytag", "MYTAG"];

        const itemWithTagsBuilder = new ItemBuilder().setCategory(
            CategoryEnum.Login,
        );

        caseInsensitiveTags.forEach((tag) => {
            itemWithTagsBuilder.addTag(tag);
        });

        const item = itemWithTagsBuilder.build();
        expect(item.tags).toBeDefined();
        expect(Array.isArray(item.tags)).toEqual(true);
        expect(item.tags.length).toEqual(caseInsensitiveTags.length);
    });

    test("adding fields: defaults", () => {
        const item = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .addField({ value: "MySecret" })
            .build();

        expect(item.fields.length).toEqual(1);

        const [field] = item.fields;

        expect(field.type).toEqual(FullItemAllOfFields.TypeEnum.String);
        expect(field.purpose).toEqual(FullItemAllOfFields.PurposeEnum.Empty);
        expect(field.generate).toEqual(false);
        expect(field.recipe).toBeUndefined();
    });

    test("adding fields: field creates a new section", () => {
        const fieldSectionName = "Test Section";

        const item = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .addField({ value: "MySecret", sectionName: fieldSectionName })
            .build();

        expect(item.sections.length).toEqual(1);
        const [section] = item.sections;
        expect(section.label).toEqual(fieldSectionName);

        expect(item.fields.length).toEqual(1);
        const [field] = item.fields;

        expect(field.section).toBeDefined();
        expect(field.section.id).toEqual(section.id);
    });

    test("adding fields: add to pre-made section", () => {
        const fieldSectionName = "Test Section";

        const item = new ItemBuilder()
            .setCategory(CategoryEnum.Login)
            .addSection(fieldSectionName)
            .addField({ value: "MySecret", sectionName: fieldSectionName })
            .build();

        expect(item.sections.length).toEqual(1);
        const [section] = item.sections;

        expect(item.fields.length).toEqual(1);
        const [field] = item.fields;

        expect(field.section).toBeDefined();
        expect(field.section.id).toEqual(section.id);
    });

    describe("Field GeneratorRecipe Configuration", () => {
        // @ts-expect-error
        const invalidRecipe: GeneratorRecipe = {
            length: 6,
            characterSets: new Array("adfioadhfg"),
        } as GeneratorRecipe;

        const validRecipe: GeneratorRecipe = {
            length: 6,
            characterSets: new Array(GeneratorRecipe.CharacterSetsEnum.Digits),
        };

        const builder = new ItemBuilder();

        beforeEach(() => builder.setCategory(CategoryEnum.Login));
        afterEach(() => builder.reset());

        it("adds recipe when generate = true", () => {
            builder.addField({
                value: "MySecret",
                generate: true,
                recipe: validRecipe,
            });

            const item = builder.build();

            expect(item.fields.length).toEqual(1);
            const [field] = item.fields;
            expect(field.generate).toEqual(true);
            expect(field.recipe.characterSets).toEqual(
                validRecipe.characterSets,
            );
        });

        it("does not add recipe when generate = false", () => {
            builder.addField({
                value: "MySecret",
                generate: false,
                recipe: validRecipe,
            });

            const item = builder.build();

            expect(item.fields.length).toEqual(1);
            const [field] = item.fields;

            expect(field.recipe).toBeUndefined();
        });

        it("throws an error when recipe is invalid", () => {
            expect(() => {
                builder.addField({
                    value: "MySecret",
                    generate: true,
                    recipe: invalidRecipe,
                });
            }).toThrowError();
        });

        it("does not throw invalid recipe error if generate = false", () => {
            // system ignores recipe if the field isn't marked to be generated
            expect(() => {
                builder.addField({
                    value: "MySecret",
                    generate: false,
                    recipe: invalidRecipe,
                });
            }).not.toThrowError();

            const item = builder.build();
            expect(item.fields.length).toEqual(1);
            const [field] = item.fields;
            expect(field.generate).toEqual(false);
            expect(field.recipe).toBeUndefined();
        });

        it("deduplicates allowed characterSets", () => {
            builder.addField({
                value: "MySecret",
                generate: true,
                recipe: {
                    characterSets: [
                        GeneratorRecipe.CharacterSetsEnum.Digits,
                        GeneratorRecipe.CharacterSetsEnum.Digits,
                    ],
                },
            });

            const item = builder.build();

            const [field] = item.fields;
            expect(field.generate).toEqual(true);
            expect(field.recipe.characterSets).toStrictEqual([
                GeneratorRecipe.CharacterSetsEnum.Digits,
            ]);
        });

        it("deduplicates excludeCharacters", () => {
            builder.addField({
                value: "MySecret",
                generate: true,
                recipe: {
                    excludeCharacters: "aa11bb22cc",
                },
            });

            const item = builder.build();

            const [field] = item.fields;
            expect(field.generate).toEqual(true);
            expect(field.recipe.excludeCharacters).toStrictEqual("a1b2c");
        });
    });
});

describe("Use ENV Vars as default values", () => {
    const ENV_BACKUP = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ENV_BACKUP };
    });

    afterAll(() => {
        process.env = ENV_BACKUP;
    });

    test("Error thrown when Item Category undefined", () => {
        const builder = new ItemBuilder();
        expect(() => {
            builder.build();
        }).toThrowError();
    });
});
