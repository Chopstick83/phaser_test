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

function countElementInArray(arr, element) {
    return arr.filter(x => x === element).length;
}

function checkDiceRanking(scene) {
    let dice = scene.dice;
    let result_text = "";

    let dice_list = dice.map(({ value }) => value);
    dice_list.sort();
    result_text += dice_list.join(', ') + '\n';

    let sum = dice_list.reduce(( accumulator, currentValue ) => accumulator + currentValue, 0);
    let set = new Set(dice_list);

    if (set.size === 1) {
        // Yacht dice
        result_text += 'Yacht dice. 50 pt. Fixed\n';
    } else {
        result_text += 'No Yacht dice.\n';
    }
    if (set.size === 2) {
        // Four of kind or Full house
        if (countElementInArray(dice_list, dice_list[0]) === 1) {
            result_text += 'Four of kind. ' + dice_list[1] + '*4=' + (dice_list[1] * 4) + '\n';
        } else if (countElementInArray(dice_list, dice_list[0]) === 4) {
            result_text += 'Four of kind. ' + dice_list[0] + '*4=' + (dice_list[0] * 4) + '\n';
        } else {
            result_text += 'Full House. Sum=' + sum + '\n';
        }
    } else {
        result_text += 'Neither Four of kind nor Full House\n';
    }
    if (set.size === 5 &&
        ((countElementInArray(dice_list, 1) === 1 && countElementInArray(dice_list, 6) === 0) ||
         (countElementInArray(dice_list, 6) === 1 && countElementInArray(dice_list, 1) === 0))) {
        result_text += 'Large Straight. 30 pt. Fixed\n';
    } else {
        result_text += 'No Large Straight.\n';
    }
    if (set.size >= 4 &&
        (countElementInArray(dice_list, 3) > 0 && countElementInArray(dice_list, 4) > 0) &&
        ((countElementInArray(dice_list, 1) > 0 && countElementInArray(dice_list, 2) > 0) ||
         (countElementInArray(dice_list, 2) > 0 && countElementInArray(dice_list, 5) > 0) ||
         (countElementInArray(dice_list, 5) > 0 && countElementInArray(dice_list, 6) > 0))) {
        result_text += 'Small Straight. 30 pt. Fixed\n';
    } else {
        result_text += 'No Small Straight.\n';
    }
    
    let ones = countElementInArray(dice_list, 1);
    let twos = countElementInArray(dice_list, 2);
    let threes = countElementInArray(dice_list, 3);
    let fours = countElementInArray(dice_list, 4);
    let fives = countElementInArray(dice_list, 5);
    let sixes = countElementInArray(dice_list, 6);
    let choice = sum;
    result_text += 'ones:' + (ones) + ', twos:' + (twos*2) + ', threes:' + (threes*3) + ', fours:' + (fours*4)
                 + ', fives:' + (fives*5) + ', sixes:' + (sixes*6) + ', choice:' + (choice);

    scene.result_text.setText(result_text);
}

export default class MainScene extends Phaser.Scene {
    constructor ()
    {
        super('MainScene');
        this.timer_text; // Time text
        this.timer; // Timer object
        this.time_ms;
        this.dice;
        this.result_text;
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
        this.add.text(200, 30, "Click/Unclick To Lock Dice", { fontFamily: 'Microsoft Sans Serif', fontSize: '32px', fill: '#000' });

        // Set 5 dices
        let num_dice = 5;
        let width = 100;
        let height = 100;
        let margin_left = 100;
        let margin_top = 200;
        let color = 0x6666ff;

        let scene = this;
        this.dice = [];
        [...Array(num_dice).keys()].forEach(function(element, index) {
            let x = margin_left * 2 * element + margin_left;
            let y = margin_top;
            let current_dice = scene.add.rectangle(x, y, width, height, color).setInteractive();
            let current_dice_number = 1;
            let current_dice_text = scene.add.text(x, y, current_dice_number.toString(), { fontFamily: 'Microsoft Sans Serif', fontSize: '32px', fill: '#000' });
            addClickEvent(current_dice, function() {
                scene.dice[index].is_locked = !scene.dice[index].is_locked;
                if (scene.dice[index].is_locked) {
                    current_dice.setStrokeStyle(3, 0xff0000, 1.0);
                } else {
                    current_dice.setStrokeStyle();
                }
            });
            scene.dice.push({'dice':current_dice, 'value':current_dice_number, 'dice_text':current_dice_text, 'is_locked':false});
        });

        let reroll_x = 50;
        let reroll_y = 50;
        let reroll_button = this.add.rectangle(reroll_x, reroll_y, width, height, 0x1199ff).setInteractive();
        this.add.text(reroll_x-40, reroll_y, 'Reroll', { fontFamily: 'Microsoft Sans Serif', fontSize: '24px', fill: '#000' });
        addClickEvent(reroll_button, function() {
            scene.dice.forEach((function(element) {
                if (element.is_locked === false) {
                    let new_number = window.math.randomInt(1, 6+1);
                    element.value = new_number;
                    element.dice_text.setText(element.value);
                }
            }));

            checkDiceRanking(scene);
        });

        // Timer
        this.add.text(700, 30, "Time", { fontFamily: 'Microsoft Sans Serif', fontSize: '32px', fill: '#000' });
        this.timer_text = this.add.text(700, 70, "00:00:00", { fontFamily: 'Microsoft Sans Serif', fontSize: '32px', fill: '#000' });
        this.time_ms = 0;
        this.timer = this.time.addEvent({
            delay: 500, // ms
            callback: this.ontimer,
            //args: [],
            callbackScope: this,
            loop: true
        });

        // Result
        this.result_text = this.add.text(500, 370, "Result here", { fontFamily: 'Microsoft Sans Serif', fontSize: '32px', fill: '#000' });
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
