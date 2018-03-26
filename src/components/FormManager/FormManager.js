import react from 'react';
import {Button} from "react-bootstrap";
import FormViewer from "../FormViewer/FormViewer";
import "./FormManager.scss";
import FormEditor from "../FormEditor/FormEditor";

class FormManager extends react.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPreview: !!props.showPreview,
            editedQuestions: []
        };

        this.togglePreviewMode = this.togglePreviewMode.bind(this);
        this.saveEdits = this.saveEdits.bind(this);
    }

    togglePreviewMode(showPreview) {
        this.setState({showPreview: showPreview});
    }
    saveEdits(edits) {
        console.log('edits: ', edits);
        
        // this.setState({editedQuestions: edits})
    }
    // shouldComponentUpdate(nextProps, nextState) {
    //     if(this.props.questions === nextState.questions) {
    //         return false;
    //     }
    // }
    render() {
        const {showPreview, editedQuestions} = this.state;
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
            <FormViewer questions={questions}
                        isVisible={showPreview}
            /> 
            <FormEditor questions={questions}
                        onSave={onSave}
                        isVisible={!showPreview}
                        emitQuestions={this.saveEdits}
            />
        </div>;
    }
}

export default FormManager;