import React from 'react';
import {Image, Button} from 'react-bootstrap'
import JoinProcessView from './JoinProcessView'
import VolunteerRequestModel from "../../model/VolunteerRequestModel";
import * as Consts from '../../model/consts'
import {observer} from "mobx-react/index";
import './VolunteerRequest.scss';
import './VolunteerRequestMobile.scss';
import FormLanguagePicker from "../FormLanguagePicker/FormLanguagePicker";
import classNames from "classnames";
const queryString = require('query-string');

const volunteerRequestModel = new VolunteerRequestModel();

class VolunteerRequest extends React.Component {
    constructor(props) {
        super(props);

        this.state = {language: "he"};

        // auto open department
        const queryParams = queryString.parse(this.props.location.search);
        const departmentId = queryParams['departmentId'];
        const secret = queryParams['secret'];
        if (departmentId && secret) {
            volunteerRequestModel.startJoinProcess(departmentId)
        } else if (departmentId) {
            const department = volunteerRequestModel.departments.find(department => department._id === departmentId)
            if (department.status.availableToJoin) {
                volunteerRequestModel.startJoinProcess(departmentId)
            }
        }

        this.handleOnChangeLanguage = this.handleOnChangeLanguage.bind(this);
    }

    handleOnChangeLanguage(language) {
        this.setState({language});
    }

    render() {
        const departments = volunteerRequestModel.departments;

        if (!departments) return <div>Loading</div>;

        const {language} = this.state;

        const rtl = language === "he";

        return (
            <div className="requests-view">
                <div className={classNames("card", "container", {rtl: language === "he"})}>
                    <header>
                        <h1>{rtl ? "השתתפות במידברן" : "Participation at Midburn!"}</h1>
                        <FormLanguagePicker value={language} onChange={this.handleOnChangeLanguage}/>
                    </header>
                    
                    {rtl ?
                    <p>
                        כל אחד מוזמן להשתתף, כל אחת מוזמנת לשחק. <br/>
                        אנו הופכים את העולם לממשי דרך פעולות הפותחות את הלב. <br/>
                        שלא כמו בפסטיבלים מסורתיים, מידברן הוא אירוע שמושתת כולו על מעורבות המשתתפים בו. <br/>
                        אתן אלה שהופכות את מידברן למה שהוא. <br/>
                        אתם אחראים לחוויה שלכם. אין צופים מהצד!
                    </p>
                        :
                    <p>
                        Everyone is welcome to participate and play. <br/>
                        We bring this inspiring world to life through our heart-opening actions.<br/>
                        Unlike other festivals, Midburn is an event entirely participant-led. We are responsible for our experience. <br/>
                        We are the creators and turn Midburn into what it is.<br/>
                        No one stands on the sidelines!
                    </p>
                    }
                    

                    {/* <div><br/>* Join requests are coming soon</div> */}
                    <div className="requests-list">
                        {departments
                            .sort((a, b) => {
                                if (a.status.availableToJoin && !b.status.availableToJoin) return -1;
                                if (!a.status.availableToJoin && b.status.availableToJoin) return 1;
                                const aName = rtl ? a.basicInfo.nameHe : a.basicInfo.nameEn;
                                const bName = rtl ? b.basicInfo.nameHe : b.basicInfo.nameEn;
                                if (!aName) return -1;
                                if (!bName) return 1;
                                return aName.localeCompare(bName);
                            })
                            .map(department => {
                                const basicInfo = department.basicInfo;
                                const departmentLogo = basicInfo.imageUrl ? basicInfo.imageUrl : Consts.DEFAULT_LOGO;
                                const requestState = volunteerRequestModel.requestState(department._id);
                                return (
                                    <div className="department" key={department._id}>
                                        <div className="requests-department-top">
                                            <Image src={departmentLogo} className="request-department-logo"/>
                                            <h2 className="requests-department-title">
                                                {rtl ? basicInfo.nameHe : basicInfo.nameEn}
                                            </h2>
                                        </div>
                                        <p className="requests-department-text">
                                            {rtl ? basicInfo.descriptionHe : basicInfo.descriptionEn}
                                        </p>
                                        {(requestState === 'Opened') ?
                                            <Button bsStyle="primary" className="request-join-button"
                                                    onClick={() => volunteerRequestModel.startJoinProcess(department._id)}>
                                                {rtl ? "הצטרף" : "Join"}
                                            </Button> :
                                            <div className="closed">{rtl ? "סגור" : "Closed"}</div>
                                        }
                                    </div>
                                )
                            })}
                    </div>
                </div>

                <JoinProcessView volunteerRequestModel={volunteerRequestModel}/>

            </div>);
    }
}

export default observer(VolunteerRequest);
