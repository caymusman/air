function buttonLocation(json){
    let returnString = "";
    if(json.hasOwnProperty('state')){
        returnString += json.state + ", ";
    }
    returnString += json.country;
    return returnString;
}

class App extends React.Component{
    constructor(props){
        super(props);

        this.state={
            cityData: null,
            inputVal: "",
            renderButtons: false,
            citiesJSON: [],
            cityName: ""
        }

        this.handleInputChange=this.handleInputChange.bind(this);
        this.handleInputSubmit=this.handleInputSubmit.bind(this);
        this.handleLocationOptions=this.handleLocationOptions.bind(this);
        this.handleCityButtons=this.handleCityButtons.bind(this);
        this.getData=this.getData.bind(this);
        this.handleClear=this.handleClear.bind(this);

        this.alert=this.alert.bind(this);
    }

    alert(msg){
        this.setState({
            isAlerted: true,
            alertText: msg
        })
        setTimeout(() => {
            this.setState({
                isAlerted: false,
                alertText: ""
            })
        }, 2000);
    }

    handleClear(){
        this.setState({
            cityData: null,
            inputVal: "",
            renderButtons: false,
            citiesJSON: [],
            cityName: ""
        })
    }

    handleInputChange(event){
        this.setState({
            inputVal: event.target.value
        })
    }

    handleCityButtons(json, loc){
        this.getData(json);
        this.setState({
            cityName: json.name + " " + loc
        })
    }

    handleInputSubmit(){
        let rgx = /[^a-zA-Z0-9 -]/;
        let input = this.state.inputVal.replace(rgx, "");

        if(input == ""){
            this.alert("Try looking up something!");
        }else{
            fetch("http://localhost:3000/api/geo/" + input)
            .then(res => res.json())
            .then(res => {
                if(res.cod == 400){
                    this.handleClear();
                    this.alert("Sorry, that value is not available!");
                }else{
                    this.handleLocationOptions(res);
                }
            })
            .catch(err => {
                console.log("This is the input error: " + err);
            });
        }
    }

    handleLocationOptions(json){
        console.log(json);
        if(json.length == 0){
            this.handleClear();
            this.alert("Input not recognized.");
        }
        else if(json.length == 1){
            this.getData(json[0])
            let name = json[0].name;
            json[0].hasOwnProperty("state") ? name += " " + json[0].state + ", " : name += " ";
            name += json[0].country;
            this.setState({
                cityName: name
            })
        }else{
            this.setState({
                renderButtons: true,
                citiesJSON: json
            })
        }
    }

    getData(json){
        fetch("/api/air/" + json.lat + "/" + json.lon)
        .then(res => res.json())
        .then(res => this.setState({cityData: res}))
        .catch(err => console.log("This is the data error: " + err));
    }

    render(){
        let buttons = [];
        if(this.state.renderButtons){
            this.state.citiesJSON.forEach((element, index) => {
                buttons.push(<MyButton onClick={this.handleCityButtons} json={element} key={index}/>)
            })
        }
        return(
            <div id="main">
                <input id="input" type="text" onChange={this.handleInputChange} value={this.state.inputVal}/>
                <div id="inputButtons">
                    <input id="submit" type="button" onClick={this.handleInputSubmit} value="Submit"></input>
                    <button id="clear" onClick={this.handleClear}>Clear</button>
                </div>
                <p id="alert">{this.state.isAlerted ? this.state.alertText : ""}</p>
                <div id="cityButtons">
                    {buttons}
                </div>

                <div id="data">
                    <p>{this.state.cityData ? this.state.cityName : ""}</p>
                    <p>DT: {this.state.cityData ? this.state.cityData.list[0].dt : ""}</p>
                    <p>AQI: {this.state.cityData ? this.state.cityData.list[0].main.aqi : ""}</p>
                    <p>C02: {this.state.cityData ? this.state.cityData.list[0].components.co : ""}</p>
                    <p>N0: {this.state.cityData ? this.state.cityData.list[0].components.no : ""}</p>
                    <p>N02: {this.state.cityData ? this.state.cityData.list[0].components.no2 : ""}</p>
                </div>
            </div>
        )
    }
}

class MyButton extends React.Component{
    constructor(props){
        super(props);
    }



    buttonLocation(json){
        let returnString = "";
        if(json.hasOwnProperty('state')){
            returnString += json.state + ", ";
        }
        returnString += json.country;
        return returnString;
    }

    render(){
        let loc = buttonLocation(this.props.json)
        return(
            <button className="buttonClass" onClick={() => {this.props.onClick(this.props.json, loc)}}>
                {this.props.json.name} {loc} Lat: {this.props.json.lat} Lon: {this.props.json.lon}
                </button>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("App"));
