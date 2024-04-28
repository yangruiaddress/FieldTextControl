import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

import { FieldTextControl } from "./FieldTextControl";

initializeIcons();

export class FieldTextEvents {
    public readonly fieldName = VSS.getConfiguration().witInputs.FieldName;
    public readonly fieldValue = VSS.getConfiguration().witInputs.FieldValue;
    public readonly textValue = VSS.getConfiguration().witInputs.TextValue;
    private readonly _container = document.getElementById("container") as HTMLElement;
    private _onRefreshed: () => void;
    /** Counter to avoid consuming own changed field events. */

    public async refresh(fieldNameValue?: string): Promise<void> {
        let error = <></>;
        if (!fieldNameValue) {
            await this._initialize();
        }

        fieldNameValue = await this._getFieldNameValue();

        ReactDOM.render(<FieldTextControl
            fieldNameValue={fieldNameValue}
            onInputChanged={this._setFieldValue}
            width={this._container.scrollWidth}
            placeholder={fieldNameValue.length ? "" : "Input text"}
            onResize={this._resize}
            error={error}
        />, this._container, () => {
            this._resize();
            if (this._onRefreshed) {
                this._onRefreshed();
            }
        });
    }
    private _resize = () => {
        VSS.resize(this._container.scrollWidth || 200, this._container.scrollHeight || 40);
    }
    private async _getFieldNameValue(): Promise<string> {
        const value = await this.getFieldValue(this.fieldName);
        if (typeof value !== "string") {
            return value.toString();
        }
        return value;
    }
    private _setFieldValue = async (value?: string): Promise<void> => {

        const formService = await WorkItemFormService.getService();

        await formService.setFieldValue(this.fieldName, value?.length ? value : "");

        return new Promise<void>((resolve) => {
            this._onRefreshed = resolve;
        });
    }
    private async getFieldValue(fieldName: string): Promise<any> {
        const formService = await WorkItemFormService.getService();
        fieldName = fieldName.toLowerCase()

        if (fieldName == "id") {
            return formService.getId();
        }

        try {
            const fields = await formService.getFields();
            const field = fields.filter(x => x.name.toLowerCase() == fieldName)[0];

            if (field) {
                return await formService.getFieldValue(field.referenceName);
            } else {
                return null;
            }
        } catch {
            return null;
        }
    }

    private _initialize = async(): Promise<void> =>{
        const formService = await WorkItemFormService.getService();

        const value = await this.getFieldValue(this.fieldValue);
        const initializeValue = this.textValue + value;
        await formService.setFieldValue(this.fieldName, initializeValue);

        return new Promise<void>((resolve) => {
            this._onRefreshed = resolve;
        });
    }
}
