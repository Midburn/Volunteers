import react from 'react';
import {Button} from "react-bootstrap";
import FormViewer from "../FormViewer/FormViewer";
import "./FormManager.scss";
import FormEditor from "../FormEditor/FormEditor";

class FormManager extends react.Component {
    constructor(props) {
        super(props);

        this.state = {showPreview: !!props.showPreview};

        this.togglePreviewMode = this.togglePreviewMode.bind(this);
    }

    togglePreviewMode(showPreview) {
        this.setState({showPreview: showPreview});
    }

    render() {
        const {showPreview} = this.state;
        const {questions, onSave} = this.props;

        if (!questions) return null;

        return <div className="form-manager">
            <header>
                <h2>Basic Volunteer Form</h2>
                <Button bsStyle="link"
                        onClick={() => this.togglePreviewMode(!showPreview)}>
                    {showPreview ? "Edit" : "Preview"}
                </Button>
            </header>

            {showPreview ?
                <FormViewer questions={questions}/> :
                <FormEditor questions={questions}
                            onSave={onSave}
                />}
        </div>;
    }
}

export default FormManager;