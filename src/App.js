import React, { Component } from 'react';
import './App.css';
import Pitchfinder from 'pitchfinder';
import frequencies from './frequencies.json'
import frequency2note from './frequency2note.json'

class App extends Component {
  constructor(){
    super();
    this.state = {
      pitch: null
    }
  }
  detectPitch() {
    const detectPitch = Pitchfinder.AMDF();
    var audioContext = new AudioContext();
    var analyser = audioContext.createAnalyser();
    navigator
    .mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
      audioContext.createMediaStreamSource(stream).connect(analyser);

        const arrayUInt = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(arrayUInt);

        setInterval(() => {
          const array32 = new Float32Array(analyser.fftSize);
          analyser.getFloatTimeDomainData(array32);

          const pitch = detectPitch(array32);
          // this.setState({pitch});
          console.log("pitch", pitch);
          this.getNoteFromPitch(pitch);
        }, 500);
    });
  }
  getNoteFromPitch(pitch){
    if(pitch !== null) {
      const closestFrequency = this.findClosest(pitch);
      const closestNote = frequency2note[closestFrequency];
      const percentage = this.getPercentage(closestFrequency, pitch)
      this.setState({note: closestNote, pitch, difference: closestFrequency - pitch, percentage, closestFrequency});
    }
  }
  findClosest(frequency){
    return frequencies.reduce(function(prev, curr) {
      return (Math.abs(curr - frequency) < Math.abs(prev - frequency) ? curr : prev);
    });
  }
  getPercentage(closestNote, pitch){
    const difference = closestNote - pitch
    if(difference > 0) {
      const previousNote = closestNote/(2^(1/12))
      return "+" + parseFloat(100 - ((pitch-previousNote)/(closestNote-previousNote))*100).toFixed(2)
    } else if(difference < 0) {
      const nextNote = closestNote*(2^(1/12))
      return "-" + parseFloat(((pitch-closestNote)/(nextNote-closestNote))*100).toFixed(2)
    } else {
      return 0;
    }
  }
  render() {
    // this.detectPitch();

    return (
      <div className="App">
        <header className="App-header">
          <button onClick={() => this.detectPitch()}> Tune It </button><br/>
          Note: {this.state.note} <br/>
          Difference: {this.state.difference} <br/>
          percentage: {this.state.percentage} <br/>
          Pitch: {this.state.pitch} <br/>
          Closest: {this.state.closestFrequency} <br/>
        </header>
      </div>
    );
  }
}

export default App;
