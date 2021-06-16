var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function buttonLocation(json) {
    var returnString = "";
    if (json.hasOwnProperty('state')) {
        returnString += json.state + ", ";
    }
    returnString += json.country;
    return returnString;
}

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.state = {
            cityData: null,
            inputVal: "",
            renderButtons: false,
            citiesJSON: [],
            cityName: ""
        };

        _this.handleInputChange = _this.handleInputChange.bind(_this);
        _this.handleInputSubmit = _this.handleInputSubmit.bind(_this);
        _this.handleLocationOptions = _this.handleLocationOptions.bind(_this);
        _this.handleCityButtons = _this.handleCityButtons.bind(_this);
        _this.getData = _this.getData.bind(_this);
        _this.handleClear = _this.handleClear.bind(_this);

        _this.alert = _this.alert.bind(_this);
        return _this;
    }

    _createClass(App, [{
        key: "alert",
        value: function alert(msg) {
            var _this2 = this;

            this.setState({
                isAlerted: true,
                alertText: msg
            });
            setTimeout(function () {
                _this2.setState({
                    isAlerted: false,
                    alertText: ""
                });
            }, 2000);
        }
    }, {
        key: "handleClear",
        value: function handleClear() {
            this.setState({
                cityData: null,
                inputVal: "",
                renderButtons: false,
                citiesJSON: [],
                cityName: ""
            });
        }
    }, {
        key: "handleInputChange",
        value: function handleInputChange(event) {
            this.setState({
                inputVal: event.target.value
            });
        }
    }, {
        key: "handleCityButtons",
        value: function handleCityButtons(json, loc) {
            this.getData(json);
            this.setState({
                cityName: json.name + " " + loc
            });
        }
    }, {
        key: "handleInputSubmit",
        value: function handleInputSubmit() {
            var _this3 = this;

            var rgx = /^([a-zA-Z0-9\u0080-\u024F]+(?:\. |-| |'))*[a-zA-Z0-9\u0080-\u024F]*$/;
            var input = void 0;
            if (rgx.test(this.state.inputVal)) {
                input = this.state.inputVal;
            } else {
                this.handleClear();
                this.alert("We cannot support that input");
                return;
            }
            this.handleClear();

            if (input == "") {
                this.alert("Try looking up something!");
            } else {
                fetch("http://localhost:3000/api/geo/" + input, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }).then(function (res) {
                    return res.json();
                }).then(function (res) {
                    if (res.cod == 400) {
                        _this3.handleClear();
                        _this3.alert("Sorry, that value is not available!");
                    } else {
                        _this3.handleLocationOptions(res);
                    }
                }).catch(function (err) {
                    console.log("This is the input error: " + err);
                });
            }
        }
    }, {
        key: "handleLocationOptions",
        value: function handleLocationOptions(json) {
            console.log(json);
            if (json.length == 0) {
                this.handleClear();
                this.alert("Input not recognized.");
            } else if (json.length == 1) {
                this.getData(json[0]);
                var name = json[0].name;
                json[0].hasOwnProperty("state") ? name += " " + json[0].state + ", " : name += " ";
                name += json[0].country;
                this.setState({
                    cityName: name
                });
            } else {
                this.setState({
                    renderButtons: true,
                    citiesJSON: json
                });
            }
        }
    }, {
        key: "getData",
        value: function getData(json) {
            var _this4 = this;

            fetch("/api/time/" + json.lat + "/" + json.lon).then(function (res) {
                return res.json();
            }).then(function (res) {
                return _this4.setState({ date: { form: res.formatted, abbr: res.abbreviation } });
            }).catch(function (err) {
                return console.log("The client time error was: " + err);
            });

            fetch("/api/air/" + json.lat + "/" + json.lon).then(function (res) {
                return res.json();
            }).then(function (res) {
                return _this4.setState({ cityData: res });
            }).catch(function (err) {
                return console.log("This is the data error: " + err);
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this5 = this;

            var buttons = [];
            if (this.state.renderButtons) {
                this.state.citiesJSON.forEach(function (element, index) {
                    buttons.push(React.createElement(MyButton, { onClick: _this5.handleCityButtons, json: element, key: index }));
                });
            }
            return React.createElement(
                "div",
                { id: "main" },
                React.createElement(
                    "div",
                    { id: "inputDiv" },
                    React.createElement("img", { src: "fa-icons/cloud.svg" }),
                    React.createElement("input", { id: "input", type: "text", onChange: this.handleInputChange, value: this.state.inputVal })
                ),
                React.createElement(
                    "div",
                    { id: "inputButtons" },
                    React.createElement("input", { id: "submit", type: "button", onClick: this.handleInputSubmit, value: "Submit" }),
                    React.createElement(
                        "button",
                        { id: "clear", onClick: this.handleClear },
                        "Clear"
                    )
                ),
                React.createElement(
                    "p",
                    { id: "alert" },
                    this.state.isAlerted ? this.state.alertText : ""
                ),
                React.createElement(
                    "div",
                    { id: "cityButtons" },
                    buttons
                ),
                React.createElement(
                    "div",
                    { id: "dataWrapper" },
                    this.state.cityData && this.state.date ? React.createElement(DataArea, { cityData: this.state.cityData, name: this.state.cityName, date: this.state.date }) : null
                )
            );
        }
    }]);

    return App;
}(React.Component);

var DataArea = function (_React$Component2) {
    _inherits(DataArea, _React$Component2);

    function DataArea(props) {
        _classCallCheck(this, DataArea);

        var _this6 = _possibleConstructorReturn(this, (DataArea.__proto__ || Object.getPrototypeOf(DataArea)).call(this, props));

        _this6.color = ['#76bf76', '#E7E772', '#F1B97E', '#D95858', '#9b76bf'];
        return _this6;
    }

    //
    //#5da35d


    _createClass(DataArea, [{
        key: "render",
        value: function render() {
            var aqi = this.props.cityData.list[0].main.aqi;
            var splitForm = this.props.date.form.split(" ");
            return React.createElement(
                "div",
                { id: "dataOuter" },
                React.createElement(
                    "div",
                    { id: "dataHeader" },
                    React.createElement(
                        "h3",
                        null,
                        this.props.name
                    ),
                    React.createElement(
                        "p",
                        null,
                        splitForm[1] + " " + this.props.date.abbr,
                        " on ",
                        new Date(splitForm[0]).toUTCString().slice(0, -13)
                    ),
                    React.createElement(
                        "sub",
                        null,
                        "Last batched on ",
                        new Date(Number(this.props.cityData.list[0].dt + "000")).toUTCString()
                    )
                ),
                React.createElement(
                    "p",
                    { id: "aqi" },
                    "AQI: ",
                    aqi
                ),
                React.createElement(
                    "div",
                    { id: "imgWrapper", style: { backgroundColor: this.color[aqi - 1] } },
                    React.createElement("img", { src: "fa-icons/fa_" + aqi + ".svg", alt: "Face representing AQI of " + aqi })
                ),
                React.createElement(AirData, { list: this.props.cityData.list[0].components })
            );
        }
    }]);

    return DataArea;
}(React.Component);

var AirData = function (_React$Component3) {
    _inherits(AirData, _React$Component3);

    function AirData(props) {
        _classCallCheck(this, AirData);

        return _possibleConstructorReturn(this, (AirData.__proto__ || Object.getPrototypeOf(AirData)).call(this, props));
    }

    _createClass(AirData, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { id: "airData" },
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { target: "_blank", href: "https://en.wikipedia.org/wiki/Carbon_monoxide" },
                        "CO:"
                    ),
                    " ",
                    this.props.list.co
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { target: "_blank", href: "https://en.wikipedia.org/wiki/Nitric_oxide" },
                        "NO:"
                    ),
                    " ",
                    this.props.list.no
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { target: "_blank", href: "https://en.wikipedia.org/wiki/Nitrogen_dioxide" },
                        "N0",
                        React.createElement(
                            "sub",
                            null,
                            "2"
                        ),
                        ":"
                    ),
                    " ",
                    this.props.list.no2
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { target: "_blank", href: "https://en.wikipedia.org/wiki/Ozone" },
                        "O",
                        React.createElement(
                            "sub",
                            null,
                            "3"
                        ),
                        ":"
                    ),
                    " ",
                    this.props.list.o3
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { target: "_blank", href: "https://en.wikipedia.org/wiki/Sulfur_dioxide" },
                        "SO",
                        React.createElement(
                            "sub",
                            null,
                            "2"
                        ),
                        ":"
                    ),
                    " ",
                    this.props.list.so2
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { target: "_blank", href: "https://en.wikipedia.org/wiki/Particulates" },
                        "PM",
                        React.createElement(
                            "sub",
                            null,
                            "2.5"
                        ),
                        ":"
                    ),
                    " ",
                    this.props.list.pm2_5
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { target: "_blank", href: "https://en.wikipedia.org/wiki/Particulates#Size,_shape_and_solubility_matter" },
                        "PM",
                        React.createElement(
                            "sub",
                            null,
                            "10"
                        ),
                        ":"
                    ),
                    " ",
                    this.props.list.pm10
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "a",
                        { target: "_blank", href: "https://en.wikipedia.org/wiki/Ammonia" },
                        "NH",
                        React.createElement(
                            "sub",
                            null,
                            "3"
                        ),
                        ":"
                    ),
                    " ",
                    this.props.list.nh3
                )
            );
        }
    }]);

    return AirData;
}(React.Component);

var MyButton = function (_React$Component4) {
    _inherits(MyButton, _React$Component4);

    function MyButton(props) {
        _classCallCheck(this, MyButton);

        return _possibleConstructorReturn(this, (MyButton.__proto__ || Object.getPrototypeOf(MyButton)).call(this, props));
    }

    _createClass(MyButton, [{
        key: "buttonLocation",
        value: function buttonLocation(json) {
            var returnString = "";
            if (json.hasOwnProperty('state')) {
                returnString += json.state + ", ";
            }
            returnString += json.country;
            return returnString;
        }
    }, {
        key: "render",
        value: function render() {
            var _this9 = this;

            var loc = buttonLocation(this.props.json);
            return React.createElement(
                "button",
                { className: "buttonClass", onClick: function onClick() {
                        _this9.props.onClick(_this9.props.json, loc);
                    } },
                this.props.json.name,
                " ",
                loc
            );
        }
    }]);

    return MyButton;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById("App"));