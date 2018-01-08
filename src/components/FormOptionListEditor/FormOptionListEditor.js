import react from 'react';
import {Button, ControlLabel, FormGroup} from "react-bootstrap";
import "./FormOptionListEditor.scss";

class FormOptionListEditor extends react.Component {
    constructor(props) {
        super(props);

        this.state = {
            newOption: {he: "", en: ""}
        };

        this.handleOnOptionChange = this.handleOnOptionChange.bind(this);
        this.addOption = this.addOption.bind(this);
        this.deleteOption = this.deleteOption.bind(this);
        this.handleOnNewOptionChange = this.handleOnNewOptionChange.bind(this);
    }

    handleOnOptionChange(index, language, option) {
        const options = [...this.props.options];
        options[index][language] = option;

        this.props.onChange(options);
    }

    handleOnNewOptionChange(language, value) {
        this.setState({newOption: {...this.state.newOption, [language]: value}});
    }

    addOption() {
        const options = [...this.props.options];
        const {newOption} = this.state;

        if (!newOption["he"] || !newOption["en"]) return;

        options.push({he: newOption["he"], en: newOption["en"]});

        this.props.onChange(options);
        this.setState({newOption: {he: "", en: ""}});
    }

    deleteOption(index) {
        const options = [...this.props.options];
        options.splice(index, 1);

        this.props.onChange(options);
    }

    render() {
        const {options} = this.props;
        const {newOption} = this.state;


        return (
            <FormGroup className="option-list-editor">
                <ControlLabel>Options:</ControlLabel>
                {options.map((option, index) =>
                    <div key={index} className="option">
                        <input type="text" value={option["en"]}
                               onChange={event => this.handleOnOptionChange(index, "en", event.target.value)}
                        />
                        <input type="text" dir="rtl" value={option["he"]}
                               onChange={event => this.handleOnOptionChange(index, "he", event.target.value)}
                        />

                        <Button bsStyle="danger" onClick={() => this.deleteOption(index)}>Delete</Button>
                    </div>)}

                <div className="option">
                    <input type="text" placeholder="Blue" value={newOption["en"]}
                           onChange={event => this.handleOnNewOptionChange("en", event.target.value)}
                    />
                    <input type="text" placeholder="כחול" dir="rtl" value={newOption["he"]}
                           onChange={event => this.handleOnNewOptionChange("he", event.target.value)}
                    />
                    <Button bsStyle="success" onClick={this.addOption}> Add </Button>
                </div>
            </FormGroup>
        );
    }
}

export default FormOptionListEditor;