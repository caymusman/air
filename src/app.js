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
        let rgx = /^([a-zA-Z0-9\u0080-\u024F]+(?:\. |-| |'))*[a-zA-Z0-9\u0080-\u024F]*$/;
        let input;
        if(rgx.test(this.state.inputVal)){
            input = this.state.inputVal;
        }else{
            this.handleClear();
            this.alert("We cannot support that input")
            return;
        }
        this.handleClear();

        if(input == ""){
            this.alert("Try looking up something!");
        }else{
            fetch("https://cp-air-pollution.herokuapp.com/api/geo/" + input, {headers: {'Content-Type': 'text/html; charset=utf-8'}})
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
        if(json.length == 0){
            this.handleClear();
            this.alert("Sorry, we couldn't find anything for you!");
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
        fetch("/api/time/" + json.lat + "/" + json.lon)
        .then(res => res.json())
        .then(res => this.setState({date: {form: res.formatted, abbr: res.abbreviation}}))
        .catch(err => console.log("The client time error was: " + err));


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
                <div id="inputDiv">
                    <div id="inputImgWrapper">
                        <div id="inputImgBlank"></div>
                        <img src="img/cloud.svg"></img>
                    </div>
                    <input id="input" type="text" onChange={this.handleInputChange} value={this.state.inputVal} onKeyPress={(e) => {e.key == "Enter" ? this.handleInputSubmit() : ""}}/>
                </div>
                <div id="inputButtons">
                    <button id="submit" onClick={this.handleInputSubmit}>Submit</button>
                    <button id="clear" onClick={this.handleClear}>Clear</button>
                </div>
                <p id="alert">{this.state.isAlerted ? this.state.alertText : " "}</p>
                <div id="cityButtons" className={this.state.renderButtons ? "light-color-change" : ""}>
                    {buttons}
                </div>

                <div id="dataWrapper" className={this.state.cityData && this.state.date ? "dark-color-change" : ""}>
                    {this.state.cityData && this.state.date ? 
                        <DataArea cityData={this.state.cityData} name={this.state.cityName} date={this.state.date}/>
                        : null}
                </div>
            </div>
        )
    }
}

class DataArea extends React.Component{
    constructor(props){
        super(props);

        this.color=['#76bf76', '#E7E772', '#F1B97E', '#D95858', '#9b76bf'];
    }

    render(){
        let aqi = this.props.cityData.list[0].main.aqi;
        let splitForm = this.props.date.form.split(" ");
        return(
            <div id="dataOuter" className="fade-in">
                <div id="dataHeader">
                    <h3>{this.props.name}</h3>  
                    <p>{splitForm[1] + " " + this.props.date.abbr} on {new Date(splitForm[0]).toUTCString().slice(0, -13)}</p>
                </div>
                <div id="imgWrapper" style={{backgroundColor: this.color[aqi - 1]}}>
                    <img  src={"img/fa_" + aqi + ".svg"} alt={"Face representing AQI of " + aqi}></img>
                    {/*
                        Icons provided by FontAwesome.
                        License: https://fontawesome.com/license
                     */}
                     <p id="aqi"><a target='_blank' href="https://en.wikipedia.org/wiki/Air_quality_index"><abbr title="Air Quality Index">AQI</abbr></a>: {aqi}</p>
                </div>
                <AirData list={this.props.cityData.list[0].components}/>
                <p id="batch">Last batched on {new Date(Number(this.props.cityData.list[0].dt + "000")).toUTCString()}</p>
            </div>
        )
    }
}

class AirData extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div id="airData">
                <p><span><a target="_blank" href="https://en.wikipedia.org/wiki/Carbon_monoxide"><abbr title="Carbon monoxide">CO:</abbr></a> {this.props.list.co} <abbr title="Microgram per cubic meter">μg/m<sub>3</sub></abbr></span></p>
                <p><span><a target="_blank" href="https://en.wikipedia.org/wiki/Nitric_oxide"><abbr title="Nitric oxide">NO:</abbr></a> {this.props.list.no} <abbr title="Microgram per cubic meter">μg/m<sub>3</sub></abbr></span></p>
                <p><span><a target="_blank" href="https://en.wikipedia.org/wiki/Nitrogen_dioxide"><abbr title="Nitrogen dioxide">NO<sub>2</sub>:</abbr></a> {this.props.list.no2} <abbr title="Microgram per cubic meter">μg/m<sub>3</sub></abbr></span></p>
                <p><span><a target="_blank" href="https://en.wikipedia.org/wiki/Ozone"><abbr title="Ozone">O<sub>3</sub>:</abbr></a> {this.props.list.o3} <abbr title="Microgram per cubic meter">μg/m<sub>3</sub></abbr></span></p>
                <p><span><a target="_blank" href="https://en.wikipedia.org/wiki/Sulfur_dioxide"><abbr title="Sulfur Dioxide">SO<sub>2</sub>:</abbr></a> {this.props.list.so2} <abbr title="Microgram per cubic meter">μg/m<sub>3</sub></abbr></span></p>
                <p><span><a target="_blank" href="https://en.wikipedia.org/wiki/Particulates"><abbr title="Fine Particulates">PM<sub>2.5</sub>:</abbr></a> {this.props.list.pm2_5} <abbr title="Microgram per cubic meter">μg/m<sub>3</sub></abbr></span></p>
                <p><span><a target="_blank" href="https://en.wikipedia.org/wiki/Particulates#Size,_shape_and_solubility_matter"><abbr title="Coarse Particulates">PM<sub>10</sub>:</abbr></a> {this.props.list.pm10} <abbr title="Microgram per cubic meter">μg/m<sub>3</sub></abbr></span></p>
                <p><span><a target="_blank" href="https://en.wikipedia.org/wiki/Ammonia"><abbr title="Ammonia">NH<sub>3</sub>:</abbr></a> {this.props.list.nh3} <abbr title="Microgram per cubic meter">μg/m<sub>3</sub></abbr></span></p>
            </div>
        )
    }
}


class MyButton extends React.Component{
    constructor(props){
        super(props);

        this.state={
            opacity: 0
        }
    }

    buttonLocation(json){
        let returnString = "";
        if(json.hasOwnProperty('state')){
            returnString += json.state + ", ";
        }
        returnString += json.country;
        return returnString;
    }

    componentDidMount(){
        setTimeout(() => {this.setState({opacity: 1});}, 375);
    }

     
    render(){
        let loc = buttonLocation(this.props.json)
        return(
            <button className="buttonClass" style={{opacity: this.state.opacity}} onClick={() => {this.props.onClick(this.props.json, loc)}}>
                {this.props.json.name} {loc}</button>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("App"));
