import react from 'react';
import {Button, ControlLabel, FormControl, FormGroup, HelpBlock} from "react-bootstrap";
import JoinFormPreview from "../Admin/JoinFormPreview";
import "./FormEtidor.scss";

class FormEditor extends react.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPreview: !!props.showPreview,
            questions: [...props.questions],
            hasChanges: false
        };

        this.togglePreviewMode = this.togglePreviewMode.bind(this);
        this.handleOnAddQuestion = this.handleOnAddQuestion.bind(this);
        this.handleOnQuestionChange = this.handleOnQuestionChange.bind(this);
        this.handleOnQuestionTypeChange = this.handleOnQuestionTypeChange.bind(this);
        this.handleOnOptionsChange = this.handleOnOptionsChange.bind(this);
        this.deleteQuestion = this.deleteQuestion.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({questions: [...nextProps.questions]});
    }

    handleOnAddQuestion() {
        this.setState({
            hasChanges: true,
            questions: [
                ...this.state.questions,
                {
                    question: '',
                    questionType: 'text',
                    options: []
                }
            ]
        });
    }

    handleOnQuestionChange(index, value) {
        const questions = [...this.state.questions];
        questions[index].question = value;

        this.setState({questions: questions, hasChanges: true});
    }

    handleOnQuestionTypeChange(index, value) {
        const questions = [...this.state.questions];
        questions[index].questionType = value;

        this.setState({questions: questions, hasChanges: true});
    }

    handleOnOptionsChange(index, options) {
        const questions = [...this.state.questions];
        questions[index].options = options.split(',');

        this.setState({questions: questions, hasChanges: true});
    }

    deleteQuestion(index) {
        const questions = [...this.state.questions];
        questions.splice(index, 1);
        this.setState({hasChanges: true, questions});
    }

    togglePreviewMode(showPreview) {
        this.setState({showPreview: showPreview});
    }

    render() {
        const {showPreview, questions, hasChanges} = this.state;

        if (showPreview) {
            return <div style={{marginTop: 20}}>
                <Button bsStyle="link" className="edit-department-preview"
                        onClick={() => this.togglePreviewMode(false)}>
                    Edit
                </Button>
                <JoinFormPreview questions={questions}/>
            </div>;
        }

        return (<div className="form-editor" style={{marginTop: 20}}>
                <HelpBlock>
                    Please write each question in both Hebrew and English.
                    <Button bsStyle="link" className="edit-department-preview"
                            onClick={() => this.togglePreviewMode(true)}>Preview</Button>
                </HelpBlock>
                {questions.map((question, index) =>
                    <div key={index.toString()}>
                        <FormGroup controlId={`question-${index}`}>
                            <ControlLabel>
                                <span className="edit-department-question">Question {index + 1}</span>
                                <Button bsStyle="link" className="edit-department-question-delete"
                                        id={index} onClick={() => this.deleteQuestion(index)}>Delete</Button>
                            </ControlLabel>
                            <FormControl componentClass="textarea"
                                         placeholder="What's Your Favorite Color?   ?מה הצבע המועדף עליך"
                                         value={question.question}
                                         onChange={event => this.handleOnQuestionChange(index, event.target.value)}/>
                        </FormGroup>
                        <FormGroup controlId={`type-${index}`}>
                            <ControlLabel>Answer Type:</ControlLabel>
                            <FormControl componentClass="select" placeholder="Type"
                                         value={question.questionType}
                                         onChange={event => this.handleOnQuestionTypeChange(index, event.target.value)}>
                                <option value='text'>Text</option>
                                <option value='textarea'>Text Area</option>
                                <option value='checkbox'>Checkbox</option>
                                <option value='radio'>Selection</option>
                                <option value='checkboxes'>Multiple Selection</option>
                            </FormControl>
                        </FormGroup>
                        {(question.questionType === 'radio' || question.questionType === 'checkboxes') && (
                            <FormGroup controlId={`options-${index}`} style={{marginTop: 20}}>
                                <ControlLabel>Options:</ControlLabel>
                                <FormControl type="text" placeholder="Banana - בננה, Apple - תפוח, Avocado - אבוקדו"
                                             value={question.options.join()}
                                             onChange={event => this.handleOnOptionsChange(index, event.target.value)}/>
                                <HelpBlock>Please use comma separated options.</HelpBlock>
                            </FormGroup>
                        )}
                        <div className="edit-department-question-seperator"/>
                    </div>
                )}
                <footer>
                    <Button bsStyle="primary" onClick={this.handleOnAddQuestion}>Add Question</Button>
                    <Button bsStyle="primary" disabled={!hasChanges} onClick={() => this.props.onSave(questions)}>Save</Button>
                </footer>
            </div>
        );
    }
}

export default FormEditor;