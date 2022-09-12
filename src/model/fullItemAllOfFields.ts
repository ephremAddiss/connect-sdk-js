/**
 * 1Password Connect
 * API interface for the 1Password Connect server.
 *
 * The version of the OpenAPI document: 0.2.3
 * Contact: support@1password.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { FullItemAllOfSection } from './fullItemAllOfSection';
import { GeneratorRecipe } from './generatorRecipe';

export class FullItemAllOfFields {
    'id'?: string;
    'section'?: FullItemAllOfSection;
    'type'?: FullItemAllOfFields.TypeEnum;
    /**
    * Some item types, Login and Password, have fields used for autofill. This property indicates that purpose and is required for some item types.
    */
    'purpose'?: FullItemAllOfFields.PurposeEnum;
    'label'?: string;
    'value'?: string;
    /**
    * If value is not present then a new value should be generated for this field
    */
    'generate'?: boolean;
    'recipe'?: GeneratorRecipe;
    /**
    * For fields with a purpose of `PASSWORD` this is the entropy of the value
    */
    'entropy'?: number;
    'otp:'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "string"
        },
        {
            "name": "section",
            "baseName": "section",
            "type": "FullItemAllOfSection"
        },
        {
            "name": "type",
            "baseName": "type",
            "type": "FullItemAllOfFields.TypeEnum"
        },
        {
            "name": "purpose",
            "baseName": "purpose",
            "type": "FullItemAllOfFields.PurposeEnum"
        },
        {
            "name": "label",
            "baseName": "label",
            "type": "string"
        },
        {
            "name": "value",
            "baseName": "value",
            "type": "string"
        },
        {
            "name": "generate",
            "baseName": "generate",
            "type": "boolean"
        },
        {
            "name": "recipe",
            "baseName": "recipe",
            "type": "GeneratorRecipe"
        },
        {
            "name": "entropy",
            "baseName": "entropy",
            "type": "number"
        },
        {
            "name": "otp",
            "baseName": "totp",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return FullItemAllOfFields.attributeTypeMap;
    }
}

export namespace FullItemAllOfFields {
    export enum TypeEnum {
        String = <any> 'STRING',
        Email = <any> 'EMAIL',
        Concealed = <any> 'CONCEALED',
        Url = <any> 'URL',
        /** @deprecated use {@link TypeEnum.Otp} instead. */
        Totp = <any> 'OTP',
        Otp = <any> 'OTP',
        Date = <any> 'DATE',
        MonthYear = <any> 'MONTH_YEAR',
        Menu = <any> 'MENU'
    }
    export enum PurposeEnum {
        Empty = <any> '',
        Username = <any> 'USERNAME',
        Password = <any> 'PASSWORD',
        Notes = <any> 'NOTES'
    }
}
