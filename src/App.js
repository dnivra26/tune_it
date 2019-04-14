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
      this.setState({note: closestNote});
    }
  }
  findClosest(frequency){
    return frequencies.reduce(function(prev, curr) {
      return (Math.abs(curr - frequency) < Math.abs(prev - frequency) ? curr : prev);
    });
  }
  render() {
    this.detectPitch();

    return (
      <div className="App">
        <header className="App-header">
          Tune It
          {this.state.note}
        </header>
      </div>
    );
  }
}

export default App;
