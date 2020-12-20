function addClickEvent(object, callback) {
    object.on('pointerdown', function (pointer) {
        this.button_down = true;
    });
    object.on('pointerout', function (pointer) {
        this.button_down = false;
    });
    object.on('pointerup', function (pointer) {
        if (this.button_down == true) {
            callback();
        }
        this.button_down = false;
    });
}

export default class MainScene extends Phaser.Scene {
    constructor ()
    {
        super('MainScene');
        this.timer_text; // Time text
        this.timer; // Timer object
        this.time_ms;
        this.dice_text;
    }
    preload ()
    {
        // this.load.image('box', '48box.png');
    }
    ontimer()
    {
        this.time_ms += this.timer.getElapsed(); // ms
    }
    create ()
    {
        // Static text
        this.add.text(500, 30, "Time", { fontFamily: 'Microsoft Sans Serif', fontSize: '32px', fill: '#000' });

        // Set 5 dices
        let num_dice = 5;
        let width = 100;
        let height = 100;
        let margin_left = 100;
        let margin_top = 200;
        let color = 0x6666ff;

        let scene = this;
        this.dice_text = [];
        [...Array(num_dice).keys()].forEach(function(element) {
            let x = margin_left * 2 * element + margin_left;
            let y = margin_top;
            scene.add.rectangle(x, y, width, height, color);
            scene.dice_text.push(scene.add.text(x, y, '1', { fontFamily: 'Microsoft Sans Serif', fontSize: '32px', fill: '#000' }));
        });

        let reroll_x = 50;
        let reroll_y = 50;
        let reroll_button = this.add.rectangle(reroll_x, reroll_y, width, height, 0x1199ff).setInteractive();
        this.add.text(reroll_x-40, reroll_y, 'Reroll', { fontFamily: 'Microsoft Sans Serif', fontSize: '24px', fill: '#000' });
        addClickEvent(reroll_button, function() {
            scene.dice_text.forEach((function(element) {
                let new_number = window.math.randomInt(1, 6+1);
                element.setText(new_number);
            }));
        });

        // Timer
        this.timer_text = this.add.text(500, 70, "00:00:00", { fontFamily: 'Microsoft Sans Serif', fontSize: '32px', fill: '#000' });
        this.time_ms = 0;
        this.timer = this.time.addEvent({
            delay: 500, // ms
            callback: this.ontimer,
            //args: [],
            callbackScope: this,
            loop: true
        });
    }

    update ()
    {
        // Update time
        this.timer_text.text = this.ms_to_hhmmss_text(this.time_ms);
    }

    ms_to_hhmmss_text(ms)
    {
        let sec_num = Math.floor(ms / 1000);
        let hours   = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (hours   < 10) { hours   = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return hours + ':' + minutes + ':' + seconds;
    }
}
