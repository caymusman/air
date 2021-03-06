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

    //alert area for errors on inputs


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

        //reset state

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
                //fetch from backend which calls API. Change here if url changes.
                fetch("https://cp-air-pollution.herokuapp.com/api/geo/" + input, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }).then(function (res) {
                    return res.json();
                }).then(function (res) {
                    if (res.cod == 400) {
                        //handle bad url call - ex. "test"
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
            if (json.length == 0) {
                //case: nothing with that name
                this.handleClear();
                this.alert("Sorry, we couldn't find anything for you!");
            } else if (json.length == 1) {
                //case: only one place with that name
                this.getData(json[0]);
                var name = json[0].name;
                json[0].hasOwnProperty("state") ? name += " " + json[0].state + ", " : name += " ";
                name += json[0].country;
                this.setState({
                    cityName: name
                });
            } else {
                //case: multiple places with that name
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

            fetch("/api/time/" + json.lat + "/" + json.lon) //get local date and time
            .then(function (res) {
                return res.json();
            }).then(function (res) {
                return _this4.setState({ date: { form: res.formatted, abbr: res.abbreviation } });
            }).catch(function (err) {
                return console.log("The client time error was: " + err);
            });

            fetch("/api/air/" + json.lat + "/" + json.lon) //get pollution data
            .then(function (res) {
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
                    React.createElement(
                        "div",
                        { id: "inputImgWrapper" },
                        React.createElement(
                            "div",
                            { id: "inputImgBlank" },
                            String.fromCharCode(160)
                        ),
                        React.createElement("img", { src: "img/cloud.svg" })
                    ),
                    React.createElement("input", { id: "input", type: "text", onChange: this.handleInputChange, value: this.state.inputVal, onKeyPress: function onKeyPress(e) {
                            e.key == "Enter" ? _this5.handleInputSubmit() : "";
                        } })
                ),
                React.createElement(
                    "div",
                    { id: "inputButtons" },
                    React.createElement(
                        "button",
                        { id: "submit", onClick: this.handleInputSubmit },
                        "Submit"
                    ),
                    React.createElement(
                        "button",
                        { id: "clear", onClick: this.handleClear },
                        "Clear"
                    )
                ),
                React.createElement(
                    "p",
                    { id: "alert" },
                    this.state.isAlerted ? this.state.alertText : " "
                ),
                React.createElement(
                    "div",
                    { id: "cityButtons", className: this.state.renderButtons ? "light-color-change" : "" },
                    buttons
                ),
                React.createElement(
                    "div",
                    { id: "dataWrapper", className: this.state.cityData && this.state.date ? "dark-color-change" : "" },
                    this.state.cityData && this.state.date ? //conditionally render DataArea if the info is ready
                    React.createElement(DataArea, { cityData: this.state.cityData, name: this.state.cityName, date: this.state.date }) : null
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

    _createClass(DataArea, [{
        key: "render",
        value: function render() {
            var aqi = this.props.cityData.list[0].main.aqi;
            var splitForm = this.props.date.form.split(" ");
            return React.createElement(
                "div",
                { id: "dataOuter", className: "fade-in" },
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
                    )
                ),
                React.createElement(
                    "div",
                    { id: "imgWrapper", style: { backgroundColor: this.color[aqi - 1] } },
                    React.createElement("img", { src: "img/fa_" + aqi + ".svg", alt: "Face representing AQI of " + aqi }),
                    React.createElement(
                        "p",
                        { id: "aqi" },
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Air_quality_index" },
                            React.createElement(
                                "abbr",
                                { title: "Air Quality Index" },
                                "AQI"
                            )
                        ),
                        ": ",
                        aqi
                    )
                ),
                React.createElement(AirData, { list: this.props.cityData.list[0].components }),
                React.createElement(
                    "p",
                    { id: "batch" },
                    "Last batched on ",
                    new Date(Number(this.props.cityData.list[0].dt + "000")).toUTCString()
                )
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
                        "span",
                        null,
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Carbon_monoxide" },
                            React.createElement(
                                "abbr",
                                { title: "Carbon monoxide" },
                                "CO:"
                            )
                        ),
                        " ",
                        this.props.list.co,
                        " ",
                        React.createElement(
                            "abbr",
                            { title: "Microgram per cubic meter" },
                            "\u03BCg/m",
                            React.createElement(
                                "sub",
                                null,
                                "3"
                            )
                        )
                    )
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "span",
                        null,
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Nitric_oxide" },
                            React.createElement(
                                "abbr",
                                { title: "Nitric oxide" },
                                "NO:"
                            )
                        ),
                        " ",
                        this.props.list.no,
                        " ",
                        React.createElement(
                            "abbr",
                            { title: "Microgram per cubic meter" },
                            "\u03BCg/m",
                            React.createElement(
                                "sub",
                                null,
                                "3"
                            )
                        )
                    )
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "span",
                        null,
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Nitrogen_dioxide" },
                            React.createElement(
                                "abbr",
                                { title: "Nitrogen dioxide" },
                                "NO",
                                React.createElement(
                                    "sub",
                                    null,
                                    "2"
                                ),
                                ":"
                            )
                        ),
                        " ",
                        this.props.list.no2,
                        " ",
                        React.createElement(
                            "abbr",
                            { title: "Microgram per cubic meter" },
                            "\u03BCg/m",
                            React.createElement(
                                "sub",
                                null,
                                "3"
                            )
                        )
                    )
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "span",
                        null,
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Ozone" },
                            React.createElement(
                                "abbr",
                                { title: "Ozone" },
                                "O",
                                React.createElement(
                                    "sub",
                                    null,
                                    "3"
                                ),
                                ":"
                            )
                        ),
                        " ",
                        this.props.list.o3,
                        " ",
                        React.createElement(
                            "abbr",
                            { title: "Microgram per cubic meter" },
                            "\u03BCg/m",
                            React.createElement(
                                "sub",
                                null,
                                "3"
                            )
                        )
                    )
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "span",
                        null,
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Sulfur_dioxide" },
                            React.createElement(
                                "abbr",
                                { title: "Sulfur Dioxide" },
                                "SO",
                                React.createElement(
                                    "sub",
                                    null,
                                    "2"
                                ),
                                ":"
                            )
                        ),
                        " ",
                        this.props.list.so2,
                        " ",
                        React.createElement(
                            "abbr",
                            { title: "Microgram per cubic meter" },
                            "\u03BCg/m",
                            React.createElement(
                                "sub",
                                null,
                                "3"
                            )
                        )
                    )
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "span",
                        null,
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Particulates" },
                            React.createElement(
                                "abbr",
                                { title: "Fine Particulates" },
                                "PM",
                                React.createElement(
                                    "sub",
                                    null,
                                    "2.5"
                                ),
                                ":"
                            )
                        ),
                        " ",
                        this.props.list.pm2_5,
                        " ",
                        React.createElement(
                            "abbr",
                            { title: "Microgram per cubic meter" },
                            "\u03BCg/m",
                            React.createElement(
                                "sub",
                                null,
                                "3"
                            )
                        )
                    )
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "span",
                        null,
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Particulates#Size,_shape_and_solubility_matter" },
                            React.createElement(
                                "abbr",
                                { title: "Coarse Particulates" },
                                "PM",
                                React.createElement(
                                    "sub",
                                    null,
                                    "10"
                                ),
                                ":"
                            )
                        ),
                        " ",
                        this.props.list.pm10,
                        " ",
                        React.createElement(
                            "abbr",
                            { title: "Microgram per cubic meter" },
                            "\u03BCg/m",
                            React.createElement(
                                "sub",
                                null,
                                "3"
                            )
                        )
                    )
                ),
                React.createElement(
                    "p",
                    null,
                    React.createElement(
                        "span",
                        null,
                        React.createElement(
                            "a",
                            { target: "_blank", href: "https://en.wikipedia.org/wiki/Ammonia" },
                            React.createElement(
                                "abbr",
                                { title: "Ammonia" },
                                "NH",
                                React.createElement(
                                    "sub",
                                    null,
                                    "3"
                                ),
                                ":"
                            )
                        ),
                        " ",
                        this.props.list.nh3,
                        " ",
                        React.createElement(
                            "abbr",
                            { title: "Microgram per cubic meter" },
                            "\u03BCg/m",
                            React.createElement(
                                "sub",
                                null,
                                "3"
                            )
                        )
                    )
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

        var _this8 = _possibleConstructorReturn(this, (MyButton.__proto__ || Object.getPrototypeOf(MyButton)).call(this, props));

        _this8.state = {
            opacity: 0
        };
        return _this8;
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
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this9 = this;

            setTimeout(function () {
                _this9.setState({ opacity: 1 });
            }, 375);
        }
    }, {
        key: "render",
        value: function render() {
            var _this10 = this;

            var loc = buttonLocation(this.props.json);
            return React.createElement(
                "button",
                { className: "buttonClass", style: { opacity: this.state.opacity }, onClick: function onClick() {
                        _this10.props.onClick(_this10.props.json, loc);
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