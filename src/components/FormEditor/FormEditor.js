import react from 'react';
import {Button, ControlLabel, FormControl, FormGroup, ListGroup, ListGroupItem, Checkbox} from "react-bootstrap";
import "./FormEtidor.scss";
import OptionListEditor from "../FormOptionListEditor/FormOptionListEditor";

class FormEditor extends react.Component {
    constructor(props) {
        super(props);

        this.state = {
            questions: props.questions,
            hasChanges: false,
            lastNotFound: false
        };

        this.handleOnAddQuestion = this.handleOnAddQuestion.bind(this);
        this.handleOnQuestionChange = this.handleOnQuestionChange.bind(this);
        this.handleOnQuestionTypeChange = this.handleOnQuestionTypeChange.bind(this);
        this.deleteQuestion = this.deleteQuestion.bind(this);
        this.handleOnOptionsChange = this.handleOnOptionsChange.bind(this);
        this.lastEventID = this.lastEventID.bind(this);
        this.loadLastForm = this.loadLastForm.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.version !== this.props.version) {
            this.setState({questions: [...this.props.questions]});
        }
    }

    lastEventID = () => {
        if (document.events.events.length < 2) {
            return null;
        }
        return document.events.events[document.events.events.length-2];
    }

    loadLastForm() {
        const body = {
            eventId: this.lastEventID(),
            nameEn: this.props.department.basicInfo.nameEn,
            nameHe: this.props.department.basicInfo.nameHe
        }
        axios.post(`/api/v1/departments/search-form`, body)
            .then(res => {
                if (res.data.length) {
                    this.state.questions = res.data;
                    this.state.hasChanges = true;
                } else {
                    this.state.lastNotFound = true;
                }
                this.setState(this.state);
            })
            .catch(err => {
                this.state.lastNotFound = true;
                this.setState(this.state);
            });
    }

    handleOnAddQuestion() {
        const questions = [
            ...this.state.questions,
            {
                question: {
                    he: "",
                    en: ""
                },
                questionType: 'text',
                options: [],
                optional: true
            }
        ]

        this.state.questions = questions;
        this.state.hasChanges = true;
        this.setState(this.state);
    }

    handleOnQuestionChange(index, language, value) {
        const questions = [...this.state.questions];
        questions[index].question[language] = value;

        this.state.questions = questions;
        this.state.hasChanges = true;
        this.setState(this.state);
    }

    handleOnQuestionTypeChange(index, value) {
        const questions = [...this.state.questions];
        questions[index].questionType = value;

        this.state.questions = questions;
        this.state.hasChanges = true;
        this.setState(this.state);
    }

    handleOnOptionsChange(index, options) {
        const questions = [...this.state.questions];
        questions[index]["options"]  = options;

        this.state.questions = questions;
        this.state.hasChanges = true;
        this.setState(this.state);
    }

    handleOnQuestionOptionalChange(index, value) {
        const questions = [...this.state.questions];
        questions[index].optional = value;

        this.state.questions = questions;
        this.state.hasChanges = true;
        this.setState(this.state);
    }

    deleteQuestion(index) {
        const questions = [...this.state.questions];
        questions.splice(index, 1);
        
        this.state.questions = questions;
        this.state.hasChanges = true;
        this.setState(this.state);
    }

    render() {
        const {questions, hasChanges, lastNotFound} = this.state;
        const {department} = this.props;
        const lastEventID = this.lastEventID();

        if(!this.props.isVisible) {
            return null
        }
        return (<div className="form-editor" style={{marginTop: 20}}>
                <ListGroup>
                    {questions.map((question, index) =>
                        <ListGroupItem key={index} className="question">
                            <header>
                                <h3>{`Question ${index + 1}`}</h3>
                                <Button bsStyle="danger" onClick={() => this.deleteQuestion(index)}>
                                    Delete
                                </Button>
                            </header>

                            <FormGroup>
                                <ControlLabel>Question (English):</ControlLabel>
                                <FormControl componentClass="textarea"
                                             placeholder="What's Your Favorite Color?"
                                             value={question.question["en"]}
                                             onChange={event => this.handleOnQuestionChange(index, "en", event.target.value)}/>
                            </FormGroup>

                            <FormGroup>
                                <ControlLabel>Question (Hebrew):</ControlLabel>
                                <FormControl componentClass="textarea"
                                             dir="rtl"
                                             placeholder="מה הצבע המועדף עליך?"
                                             value={question.question["he"]}
                                             onChange={event => this.handleOnQuestionChange(index, "he", event.target.value)}/>
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

                            <Checkbox checked={question.optional} onChange={event => this.handleOnQuestionOptionalChange(index, event.target.checked)}>Optional</Checkbox>
                            {(question.questionType === 'radio' || question.questionType === 'checkboxes') && (
                                <OptionListEditor options={question.options}
                                                  onChange={options => this.handleOnOptionsChange(index, options)}/>
                            )}
                        </ListGroupItem>
                    )}

                </ListGroup>
                <footer>
                    <Button bsStyle="primary" onClick={this.handleOnAddQuestion}>Add Question</Button>
                    {department && lastEventID && !lastNotFound && <Button bsStyle="link" onClick={this.loadLastForm}>Load {lastEventID} form</Button>}
                    {department && lastEventID && lastNotFound && <p>Not Found</p>}
                    <Button bsStyle="primary" disabled={!hasChanges}
                            onClick={() => this.props.onSave(questions)}>Save</Button>
                </footer>
            </div>
        );
    }
}

export default FormEditor;