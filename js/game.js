import MainScene from "./scenes/MainScene.js"

var config = {
    type: Phaser.AUTO,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    backgroundColor: '#f3cca3',
    scene: [ MainScene ]
};

var game = new Phaser.Game(config);
