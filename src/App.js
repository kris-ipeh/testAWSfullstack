import logo from './logo.svg';
import './App.css';

// define the callAPI function that takes a first name and last name as parameters
let callAPI = (firstName,lastName)=>{

  console.log('callAPI');
  console.log('firstName', firstName);
  console.log('lastName', lastName);
  // instantiate a headers object
  var myHeaders = new Headers();
  // add content type header to object
  myHeaders.append("Content-Type", "application/json");
  // using built in JSON utility package turn object to string and store in a variable
  var raw = JSON.stringify({"firstName":firstName,"lastName":lastName});
  // create a JSON object with parameters for API call and store in a variable
  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
  };
  // make API call with parameters and use promises to get response
  fetch("https://nwxgy6wuqj.execute-api.eu-west-3.amazonaws.com/dev/", requestOptions)
  .then(response => response.text())
  .then(result => alert(JSON.parse(result).body))
  .catch(error => console.log('error', error));
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {process.env.REACT_APP_TEXT}
        </p>
        <form>
          <label>First Name :</label>
          <input type="text" id="fName" />
          <label>Last Name :</label>
          <input type="text" id="lName" />
          <button type="button" onClick={() => callAPI(document.getElementById('fName').value,document.getElementById('lName').value)}>Call API</button>
          {/* <button type="button" onclick="callAPI(document.getElementById('fName').value,document.getElementById('lName').value)">Call API</button> */}
        </form>
      </header>
    </div>
  );
}

export default App;
