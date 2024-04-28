import { TextField } from "office-ui-fabric-react/lib/components/TextField";
import * as React from "react";
import { DelayedFunction } from "VSS/Utils/Core";
import { BrowserCheckUtils } from "VSS/Utils/UI";

interface IFieldTextControlProps {
    fieldNameValue?: string;
    width?: number;
    readOnly?: boolean;
    placeholder?: string;
    noResultsFoundText?: string;
    searchingText?: string;
    onInputChanged?: (selection?: string) => Promise<void>;
    forceValue?: boolean;
    error: JSX.Element;
    onBlurred?: () => void;
    onResize?: () => void;
}

interface IFieldTextControlState {
    focused: boolean;
    filter: string;
    multiline: boolean;
}

export class FieldTextControl extends React.Component<IFieldTextControlProps, IFieldTextControlState> {
   
    private readonly _unfocusedTimeout = BrowserCheckUtils.isSafari() ? 2000 : 1;
    private _setUnfocused = new DelayedFunction(null, this._unfocusedTimeout, "", () => {
        this.setState({focused: false, filter: this.props.fieldNameValue?.length ? this.props.fieldNameValue : ""});
    });
    constructor(props, context) {
        super(props, context);
        this.state = { focused: false, filter: "", multiline: false };
    }
    public render() {
        return <div className="options">
            <TextField value={this.state.filter}
                autoFocus
                placeholder={this.props.placeholder}
                onKeyDown={this._onInputKeyDown}
                onBlur={this._onBlur}
                onFocus={this._onFocus}
                onChange={this._onInputChange}
                multiline={this.state.multiline}
            />
        </div>;
    }
    public componentDidUpdate() {
        if (this.props.onResize) {
            this.props.onResize();
        }
    }

    private _onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.altKey || e.shiftKey || e.ctrlKey) {
            return;
        }

        if (e.keyCode === 13 /* enter */) {
            e.preventDefault();
            e.stopPropagation();
            this.setState({filter: ""});
        }
        if (e.keyCode === 37 /* left arrow */) {
            const input: HTMLInputElement = e.currentTarget;
            if (input.selectionStart !== input.selectionEnd || input.selectionStart !== 0) {
                return;
            }
            const tags = document.querySelectorAll("#container field-text-control");
            if (tags.length === 0) {
                return;
            }
            const lastTag = tags.item(tags.length - 1) as HTMLDivElement;
            lastTag.focus();
            e.preventDefault();
            e.stopPropagation();
        }
    }
   
    private _onInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        let isMultiline = this.state.multiline;
        if(newValue != undefined ){
        const newMultiline = newValue.length > 50;
            if (newMultiline !== this.state.multiline) {
                isMultiline = newMultiline
            }
        }
        this.setState({filter: newValue || "", multiline: isMultiline});

        if (this.props.onInputChanged) {
            this.props.onInputChanged(newValue);
        }
    }
    private _onBlur = () => {
        this._setUnfocused.reset();
    }
    private _onFocus = () => {
        this._setUnfocused.cancel();
    }
}
