
export default class Converter{
    constructor(){}

     convertFromDisplay(displayValue){
        switch(displayValue){   
            case 'All': return null;
            case 'Yes': return true;
            case 'No': return false;
            default: return displayValue;
        }
    }

    convertToDisplay(logicValue){
        switch(logicValue){   
            case null: return 'All';
            case true: return 'Yes';
            case false: return 'No';
            default: return logicValue;
        }
    }
}