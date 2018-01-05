import react from 'react';
import {Button, ControlLabel, FormControl, FormGroup, ListGroup, ListGroupItem} from "react-bootstrap";
import "./FormEtidor.scss";
import OptionListEditor from "../FormOptionListEditor/FormOptionListEditor";

class FormEditor extends react.Component {
    constructor(props) {
        super(props);

        this.state = {
            questions: [...props.questions],
            hasChanges: false
        };

        this.handleOnAddQuestion = this.handleOnAddQuestion.bind(this);
        this.handleOnQuestionChange = this.handleOnQuestionChange.bind(this);
        this.handleOnQuestionTypeChange = this.handleOnQuestionTypeChange.bind(this);
        this.deleteQuestion = this.deleteQuestion.bind(this);
        this.handleOnOptionsChange = this.handleOnOptionsChange.bind(this);
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
                    question: {
                        he: "",
                        en: ""
                    },
                    questionType: 'text',
                    options: []
                }
            ]
        });
    }

    handleOnQuestionChange(index, language, value) {
        const questions = [...this.state.questions];
        questions[index].question[language] = value;

        this.setState({questions: questions, hasChanges: true});
    }

    handleOnQuestionTypeChange(index, value) {
        const questions = [...this.state.questions];
        questions[index].questionType = value;

        this.setState({questions: questions, hasChanges: true});
    }

    handleOnOptionsChange(index, options) {
        const questions = [...this.state.questions];
        questions[index]["options"]  = options;

        this.setState({questions: questions, hasChanges: true});
    }

    deleteQuestion(index) {
        const questions = [...this.state.questions];
        questions.splice(index, 1);
        this.setState({hasChanges: true, questions});
    }

    render() {
        const {questions, hasChanges} = this.state;


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


                            {(question.questionType === 'radio' || question.questionType === 'checkboxes') && (
                                <OptionListEditor options={question.options}
                                                  onChange={options => this.handleOnOptionsChange(index, options)}/>
                            )}
                        </ListGroupItem>
                    )}

                </ListGroup>
                <footer>
                    <Button bsStyle="primary" onClick={this.handleOnAddQuestion}>Add Question</Button>
                    <Button bsStyle="primary" disabled={!hasChanges}
                            onClick={() => this.props.onSave(questions)}>Save</Button>
                </footer>
            </div>
        );
    }
}

export default FormEditor;