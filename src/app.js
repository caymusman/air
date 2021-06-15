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
        let rgx = /^([a-zA-Z\u0080-\u024F]+(?:\. |-| |'))*[a-zA-Z\u0080-\u024F]*$/;
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
            fetch("http://localhost:3000/api/geo/" + input, {headers: {'Content-Type': 'text/html; charset=utf-8'}})
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
                <input id="input" type="text" onChange={this.handleInputChange} value={this.state.inputVal}/>
                <div id="inputButtons">
                    <input id="submit" type="button" onClick={this.handleInputSubmit} value="Submit"></input>
                    <button id="clear" onClick={this.handleClear}>Clear</button>
                </div>
                <p id="alert">{this.state.isAlerted ? this.state.alertText : ""}</p>
                <div id="cityButtons">
                    {buttons}
                </div>

                <div id="dataWrapper">
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

        this.color=['#008e00', '#E7E772', '#F1B97E', '#D95858', '#51255F'];
    }

    

    render(){
        let aqi = this.props.cityData.list[0].main.aqi;
        let splitForm = this.props.date.form.split(" ");
        return(
            <div id="dataOuter" style={{backgroundColor: this.color[aqi - 1]}}>
                <div id="dataHeader">
                    <h3>{this.props.name}</h3>  
                    <p>{splitForm[1] + " " + this.props.date.abbr} on {splitForm[0]}</p>
                </div>
                <p>AQI: {aqi}</p>
                <img src={"fa-icons/fa_" + aqi + ".svg"} alt={"Face representing AQI of " + aqi}></img>
                {/*
                    Icons provided by FontAwesome.
                     License: https://fontawesome.com/license
                */}
                <AirData list={this.props.cityData.list[0].components}/>
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
                <p><a target="_blank" href="https://en.wikipedia.org/wiki/Carbon_monoxide">CO:</a> {this.props.list.co}</p>
                <p><a target="_blank" href="https://en.wikipedia.org/wiki/Nitric_oxide">NO:</a> {this.props.list.no}</p>
                <p><a target="_blank" href="https://en.wikipedia.org/wiki/Nitrogen_dioxide">N0<sub>2</sub>:</a> {this.props.list.no2}</p>
                <p><a target="_blank" href="https://en.wikipedia.org/wiki/Ozone">O<sub>3</sub>:</a> {this.props.list.o3}</p>
                <p><a target="_blank" href="https://en.wikipedia.org/wiki/Sulfur_dioxide">SO<sub>2</sub>:</a> {this.props.list.so2}</p>
                <p><a target="_blank" href="https://en.wikipedia.org/wiki/Particulates">PM<sub>2.5</sub>:</a> {this.props.list.pm2_5}</p>
                <p><a target="_blank" href="https://en.wikipedia.org/wiki/Particulates#Size,_shape_and_solubility_matter">PM<sub>10</sub>:</a> {this.props.list.pm10}</p>
                <p><a target="_blank" href="https://en.wikipedia.org/wiki/Ammonia">NH<sub>3</sub>:</a> {this.props.list.nh3}</p>
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
                {this.props.json.name} {loc}</button>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("App"));
