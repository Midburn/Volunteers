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

const volunteerRequestModel = new VolunteerRequestModel();

class VolunteerRequest extends React.Component {
    constructor(props) {
        super(props);

        this.state = {language: "he"};

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
                        <h1>{rtl ? "התנדבות במידברן" : "Volunteering"}</h1>
                        <FormLanguagePicker value={language} onChange={this.handleOnChangeLanguage}/>
                    </header>

                    <p>
                        {rtl ?
                            "התנדבות היא חלק בלתי נפרד מחוויית מידברן והמתנדבים הם אלו שבונים את העיר, מתפעלים אותה ולבסוף גם דואגים לפרק אותה."
                            :
                            "Volunteering is an inseparable part of the Midburn experience. The volunteers are the ones to build, operate and teardown the city."
                        }
                    </p>

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
