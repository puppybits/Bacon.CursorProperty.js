# Bacon.CursorProperty.js

A Bacon.js plugin to create FRP data that makes **data flow** at top level concept. The hardest (and buggiest) part of any front-end application is dealing with the user. Users have a concept of time that makes it hard to rationalize and predict the relationships can conflict as cause bugs.  

The goal is to have isolated functional data that can be built and tested completly isolated from the user and the UI. The UI only has the ability to push new values into the stream which always follow the exact same predicitable path. This allows the work of each to be done in parallel as well as having minimize the effects between the data flow and the UI.  

To make an overly simpilifed analogy to a city; Modern MVC speak in terms of objects (houses and roads) with multiple ways of getting from A to B. Reactive Data Flow speaks in terms of explict single-file turn-by-turn directions to get from A to B. The path to take and the time to get from A to B is always the same because their is 0 overlapping and 0 devation from the path.  

At any point the application can export the entire application state for debugging very complex work flows, undo/redo only requires to memoize changes coming out of the stream and play it forward/backward at any place. In a full application structure there are only 2 main pieces: the View and the DataFlow. 

Immutable.js is used inside the stream to ensure that nothing inside the stream can change without an explict update call. Data Flows are encapsulated. By giving a reference to a stream that object will be able to access that model, all sub properties and update the model but not get access to anything above that level in the data model.  

## Basic Concepts

Create a root stream. Since these are all properties each stream will allows have a current value.

    let rootStream = new Bacon.CursorProperty(Immutable.fromJS{stations:['current station'], address:{city:'here'}});
  
Create streams that are connected to the model's properties.  

    let stationStream = rootStream.toCursorProperty('stations');
  
Listen for future changes to the data. This automatically hooks up to React state changes for a component.

    stationStream.assign(val => this.setState({stations:val});
    // this is called synchronously to set the value the first time
    // as soon as the global data for this value changes it will call this function again
    
Local data can be modified without affecting the values in the stream.

    this.state.stations.set(0, 'temp station');
    // the local value is changed but the global data is unchanged
    
Updating the local stream will propagate to the root then filter back down to each referance that has access to this property.

    stationStream.push(this.state.station);
    // stream returns the the root, updates then filters back down to the sub cursor streams

## Example

Example using reactive data flow with React.js to  (pseudo code)

    class Stations extends React.Component {
      componentWillMount(){
        this.props.stationStream.assign(val => this.setState({stations: val});
        this.props.stationStream.assign(val => 
          this.setState({memorizeStations: this.state.memorizeStations.concat(val.toJS())});
      }
      addStation(){
        this.props.stationStream.push('new station '+this.state.stations.count());
      }
      pop(){
        let lastValue = this.state.memorizeStations.pop();
        this.props.stationStream.push(Immutable.fromJS(lastValue));
      }
      render(){
        return (<ul>
          {this.state.stations.map(name => (<li key={name}>name</li>)}
          <button onClick={this.addStation.bind(this)}>add 1 more</button>
          <button onClick={this.pop.bind(this)}>undo</button>
        </ul>);
      }
    }
    class Main extends React.Component {
      componentWillMount(){
        this.props.rootStream.assign(val => this.setState({data: val}));
      }
      render(){
        return (<div>
          <h1>Last Station is {this.state.data.get('stations').get(-1)}</h1>
          <Stations stationStream={this.props.rootStream.toCursorProperty('stations')} />
        </div>);
      }
    }
    let rootStream = new Bacon.CursorProperty(Immutable.fromJS{stations:['current station'], address:{city:'here'}});
    React.render(<Main rootStream={rootStream}>);

