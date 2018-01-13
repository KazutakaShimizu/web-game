enchant();

var DIR_LEFT  = 0;
var DIR_RIGHT = 1;
var DIR_UP    = 2;
var DIR_DOWN  = 3;

var SCREEN_WIDTH = 640
var SCREEN_HEIGHT = 320

var PLAYER_WIDTH = 30
var PLAYER_HEIGHT = 30

var ENEMY_WIDTH = 27
var ENEMY_HEIGHT = 30

var TILE_WIDTH = 16
var TILE_HEIGHT = 16
var ITEM_WIDTH = 16
var ITEM_HEIGHT = 16

var BULLET_WIDTH = 8;
var BULLET_HEIGHT = 8;
var BULLET_SPEED = 6;

var MESSAGE_WIDTH = 50
var MESSAGE_HEIGHT = 20

var BACKGROUND_WIDTH = 1320;
var BACKGROUND_HEIGHT = 320;

var DEATH00_WIDTH = 45;
var DEATH00_HEIGHT = 45;

var DEATH01_WIDTH = 120;
var DEATH01_HEIGHT = 120;

var COIN_FRAME = 14

var game = null;
var mainScene = null;
var clearScene = null;

var PLAYER_IMAGE = "images/testkun07.png";
var ENEMY_IMAGE = "images/enemy05.png";
var MAP_IMAGE = "images/map2.png";
var ICON_IMAGE = "images/icon0.gif";
var BACKGROUND_IMAGE = "images/bg3.png"
var DEATH00_IMAGE = "images/death00.png";
var DEATH01_IMAGE = "images/death01.png";
var MESSAGE_IMAGE = "images/testmessage.png";

var ASSETS = [
    PLAYER_IMAGE, MAP_IMAGE,
    ICON_IMAGE, BACKGROUND_IMAGE,
    MESSAGE_IMAGE, ENEMY_IMAGE,
    DEATH00_IMAGE,DEATH01_IMAGE,
];

window.onload = function() {
    //ゲームオブジェクトの生成
    game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);

    //画像の読み込み
    game.preload(ASSETS);

    // 一秒間に50回描画
    game.fps = 50

    //ロード完了時に呼ばれる
    game.onload = function() {

        // タイトルシーン
        var titleScene = setupTitleScene(game.rootScene)
        titleScene.addEventListener('touchstart', function() {
            game.pushScene(mainScene);
        });
        // メインシーン
        mainScene = new MainScene();
        mainScene.onclear = function () {
            console.log("Clear !");
            game.pushScene(clearScene);
        }

        mainScene.onGameOver = function () {
            console.log("GameOver !");
            game.popScene();
        }

        // クリアーシーン
        clearScene = new ClearScene();
    },

    game.start();
};

function setupTitleScene(titleScene) {

    titleScene.backgroundColor = "#FF0000";
    var titleMessage = new Label("Hello, Title Scene");
    titleMessage.x = 10;
    titleMessage.y = 10;

    titleScene.addChild(titleMessage);

    return titleScene;
}

var MainScene = enchant.Class.create(enchant.Scene, {

    map: null,
    stage: null,
    scoreLabel: null,
    player: null,

    onenter: function () {
        var background = new Sprite(BACKGROUND_WIDTH,BACKGROUND_HEIGHT)
        background.image = game.assets[BACKGROUND_IMAGE]
        background.moveTo(0,-65);
        background.onenterframe = function () {}

        //グループ（ステージ）の生成
        this.stage = new Group();

        // mapデータの作成
        this.map = new Map(TILE_WIDTH, TILE_HEIGHT);
        this.map.image = game.assets[MAP_IMAGE];
        this.map.loadData(STAGE.map);
        this.scoreLabel = this.setupScoreLabel();

        // Playerデータの作成
        this.player = new Player();
        this.stage.addChild(background)
        this.stage.addChild(this.map);
        this.setupEnemy();
        this.setupCoin();
        this.stage.addChild(this.player);
        this.addChild(this.stage);
        this.addChild(this.scoreLabel);
    },

    onenterframe: function () {
        //ステージのXY座標の指定（カメラ）。つまるところ、ステージの背景を左側に動かしている
        var x = Math.min((game.width  - 16) / 2 - this.player.x, 0);
        var y = Math.min((game.height - 16) / 2 - this.player.y, 0);
        // console.log("x: "+x+" y: "+y);
        x = Math.max(game.width,  x + this.map.width) - this.map.width;
        y = Math.max(game.height, y + this.map.height) - this.map.height;
        this.stage.x = x;
        this.stage.y = y;
    },

    setupEnemy: function () {
        this.stage.addChild(new Enemy1(300,SCREEN_HEIGHT-32-32-32-32));
        this.stage.addChild(new Enemy1(800,SCREEN_HEIGHT-32-32-32-32));
    },

    setupCoin: function () {
        this.stage.addChild(new Coin(96,144));
        this.stage.addChild(new Coin(112,144));
        this.stage.addChild(new Coin(80,160));
    },

    setupScoreLabel: function () {

        var scoreLabel = new Label("ゴールまで : "+this.map.width);
        scoreLabel.font = "16px Tahoma";
        scoreLabel.color = "break";
        scoreLabel.x = 10;	// X座標
        scoreLabel.y = 5;	// Y座標
        scoreLabel.score = 0; // スコア値。独自のプロパテイ
        return scoreLabel;
    }

})

var ClearScene = enchant.Class.create(enchant.Scene, {

})

var Player = enchant.Class.create(enchant.Sprite, {

    initialize: function () {
        Sprite.call(this, PLAYER_WIDTH, PLAYER_HEIGHT)
        this.image = game.assets[PLAYER_IMAGE];
        // this.backgroundColor =  "rgba(0, 0, 0, 1)";
        this.frame = 0;
        this.scaleX *= 1;
        this.scaleY *= 1;
        this.x = 2 * 4;
        this.y = SCREEN_HEIGHT-32-32-32-32;
        this.dir   = DIR_DOWN;
        this.anim  = [
            0,  1,  2,  1, //左
            0,  1,  2,  1, //右
            0,  3,  0,  0, //上
            0,  0,  0,  0  //下
        ];
        this.isDrop = false;
        this.isClear = false;
        this.isDeath = false;

        this.tick = 0;

        // 重力値
        this.gravity = 0;

        // ノーマルな動きのフレーム更新処理
        this.addEventListener(Event.ENTER_FRAME, this.normal)
    },


    normal: function () {
        //落下
        this.left  = this.x;               // 左
        this.right = this.x+this.width;    // 右
        this.top   = this.y;// 上
        this.bottom = this.y+this.height;   // 下
        this.centerX = this.left + (PLAYER_WIDTH/2)
        this.centerY = this.top + (PLAYER_HEIGHT/2)

        if (this.gravity > 0) { // 上に向かう（ジャンプ中）

            this.y -= this.gravity; // 一旦キャラクターを重力値分だけ、上に移動させる
            //console.log(this.gravity);

            if (mainScene.map.hitTest(this.centerX, this.top)) { // ジャンプ中に天井（障害物）にぶつかった場合、

                this.y += this.gravity; // 上に移動した分、下に戻す

                this.gravity = 0; // 天井にぶつかり、すぐ落下させる必要があるので、強制的に重力値を0にする

            } else {

                this.gravity--; // 0になるまで上昇させる
            }
        }

        if (this.gravity === 0) { // 重力によって、下に向かう（ジャンプ中）
            // if (!map.hitTest(this.centerX, this.bottom) && !map.hitTest(this.right-4, this.bottom) && !map.hitTest(this.left+4, this.bottom)) {
            //     this.y += 1;
            // }
            // if (!map.hitTest(this.centerX, this.bottom) && !map.hitTest(this.right-4, this.bottom) && !map.hitTest(this.left+4, this.bottom)) {
            //     this.y += 3;
            // }

            if (!mainScene.map.hitTest(this.centerX, this.bottom) && !mainScene.map.hitTest(this.right, this.bottom) && !mainScene.map.hitTest(this.left, this.bottom)) { // 地面にぶつからなかった場合、下に落ちる(食い込み防止)
                this.y += 1;
            }
            if (!mainScene.map.hitTest(this.centerX, this.bottom) && !mainScene.map.hitTest(this.right, this.bottom) && !mainScene.map.hitTest(this.left, this.bottom)) { // 地面にぶつからなかった場合、下に落ちる
                this.y += 3;
            }
        }

        var input = game.input

        if (input.up) {
            this.dir = DIR_UP;
            if (mainScene.map.hitTest(this.centerX, this.bottom)) { // キャラクタが地面についている場合、ジャンプさせる
                this.gravity = 13; // 重力値をセット
            }
        }

        //左へ移動
        if (input.left) {
            this.dir = DIR_LEFT;
            if (!mainScene.map.hitTest(this.left, this.centerY)){ //左の生涯物にぶつからなかった場合、左に移動する
                this.x -= 4;
            }
            this.scaleX = -1;
        }

        //右へ移動
        if (input.right) {
            this.dir = DIR_RIGHT;
            if (!mainScene.map.hitTest(this.right-1, this.centerY)){ //右の生涯物にぶつからなかった場合、右に移動する
                this.x += 4;
            }
            this.scaleX = 1;
        }

        if(input.down) {
            this.dir = DIR_DOWN
        }

        // 画面からはみ出ないように制御
        var left = 0;
        if (this.x < left) {
            this.x = left;
        }

        //一番右端まで到達した場合
        if(this.x > (mainScene.map.width-PLAYER_WIDTH) && !this.isClear) {
            this.isClear = true;
            this.clear();
        }

        // 穴に落ちた場合
        if (this.y > SCREEN_HEIGHT + 50 && !this.isDrop) {
            this.isDrop = true;
            this.death()
        }

        //弾を出す
        if (game.frame % 50 === 0) {
            // var bullet = new Bullet(this.centerX, this.centerY, this.scaleX);
            // var bullet = createVoiceBullet("おらおらおら！", this.centerX, this.centerY);
            // mainScene.stage.addChild(bullet);
        }

        // ラベルアニメーション
        mainScene.scoreLabel.score = mainScene.map.width - this.x - 28;
        mainScene.scoreLabel.text = "天竺まであと : " + mainScene.scoreLabel.score + "km"; //スコアを加算(10点)


        // アニメーションフレームの指定
        this.tick++;
        if (!input.up && !input.down &&
            !input.left && !input.right) this.tick = 1;//静止
        if (game.frame % 5 === 0) {
            this.frame = this.anim[this.dir * 4 + (this.tick % 4)];
        }
        // console.log("tick: "+this.tick+" tick%4:", this.tick%4);
    },

    showDeath00: function () {
        if (!this.isDeath) {
            this.isDeath = true;

            this.removeEventListener(Event.ENTER_FRAME, this.showDeath00);
            var death00 = new Sprite(DEATH00_WIDTH, DEATH00_HEIGHT);
            death00.image = game.assets[DEATH00_IMAGE];
            death00.x = this.x;
            death00.y = this.y;
            var isf = true;
            console.log("oonce");
            death00.addEventListener(Event.ENTER_FRAME, function () {
                if (isf && game.frame % 30 === 0) {
                    isf = false;
                    console.log("pass");
                    this.remove(death00);
                    var death01 = new Sprite(DEATH01_WIDTH, DEATH01_HEIGHT);
                    death01.image = game.assets[DEATH01_IMAGE];
                    death01.x = death00.x;
                    death01.y = death00.y;
                    var isf1 = true;
                    death01.addEventListener(Event.ENTER_FRAME, function () {
                        if (isf1 && game.frame % 40 === 0) {
                            isf1 = false;
                            var e = new enchant.Event("GameOver")
                            mainScene.dispatchEvent(e)
                        }
                    })
                    // mainScene.stage.addChild(death01);
                }
            })
            mainScene.stage.addChild(death00);
        }
    },

    // 敵にぶつかった時
    death: function () {
        this.removeEventListener(Event.ENTER_FRAME, this.normal); // 一旦Playerのフレーム更新処理を削除
        var v = 1;
        var tick = 0;
        var isOnce = true;
        this.frame = 5;
        this.moveTo(this.x, SCREEN_HEIGHT/2);

        this.addEventListener(Event.ENTER_FRAME, this.showDeath00)
    },

    // v++;
    // if (tick % 3 === 0 && v < 3) {
    //
    //     this.scale(v, v);
    // } else if (v > 50 && isOnce) {
    //     isOnce = false;
    //     var e = new enchant.Event("GameOver")
    //     mainScene.dispatchEvent(e)
    // }
    // tick++;

    // Gameをクリアーした時
    clear: function () {
        this.removeEventListener(Event.ENTER_FRAME, this.normal); // 一旦Playerのフレーム更新処理を削除
        var isOnce = true;
        this.addEventListener(Event.ENTER_FRAME, function () { //Playerのフレーム更新処理を新しく作成

            if (isOnce) {
                isOnce = false;
                var e = new enchant.Event("clear")
                mainScene.dispatchEvent(e)
            }
        }.bind(this));
    }

});

var Enemy1 = Class.create(Sprite, {
    // 出現させる座標を引数にとってる
    initialize: function (x, y) {
        Sprite.call(this, ENEMY_WIDTH, ENEMY_HEIGHT)
        this.x = x;
        this.y = y;
        this.image = game.assets[ENEMY_IMAGE];
        this.frame = 0;
        this.dir = DIR_LEFT;
        this.scaleX = -1;
        this.isUp = true;
        this.isLeft = true
        this.isIntersect = false;
    },

    // フレームを描画する時に呼ばれるメソッド
    onenterframe: function () {
        this.left = this.x;               // キャラクターの左端
        this.right = this.x+this.width;    // 右
        this.top   = this.y;               // 上
        this.bottom = this.y+this.height;   // 下

        // 上下動の制御
        if (!this.isUp) {
            if (mainScene.map.hitTest(this.right, this.bottom)) {
                this.isUp = true;
            }
        }
        if (this.isUp) {
            if (mainScene.map.hitTest(this.right, this.top) || game.frame % 50 === 0) {
                this.isUp = false;
            }
        }        // 左右移動の制御
        if (this.dir === DIR_LEFT) {
            if (mainScene.map.hitTest(this.left, this.bottom - 12)) { //地面以外にぶつかった場合
                this.dir = DIR_RIGHT;
                this.scaleX = 1;
                this.isLeft = false;
            }
        }
        if (this.dir === DIR_RIGHT) {
            if (mainScene.map.hitTest(this.right, this.bottom - 12)) { //地面以外にぶつかった場合
                this.dir = DIR_LEFT;
                this.scaleX = -1;
                this.isLeft = true;
            }
        }

        if (this.isLeft) {
            if (this.isUp) {
                this.x -= 1;
                this.y -= 1;            
            }else{
                this.x -= 1;
                this.y += 1;
            }
        }else{
            if (this.isUp) {
                this.x += 1;
                this.y -= 1;            
            }else{
                this.x += 1;
                this.y += 1;
            }
        }

        if (mainScene.player.intersect(this)) {
            if (!this.isIntersect) {
                this.isIntersect = true;
                mainScene.player.death();
            }
        }
    },

    // 弾が当たった場合
    onhit: function () {
        console.log("hoge");

    }

})

var Enemy2 = Class.create(Sprite, {

    initialize: function (x, y) {
        Sprite.call(this, ENEMY_WIDTH, ENEMY_HEIGHT)
        this.x = x;
        this.y = y;
        this.image = game.assets[ENEMY_IMAGE];
        this.frame = 0;
        this.dir = DIR_LEFT;
        this.isIntersect = false;
    },

    onenterframe: function () {

        this.left = this.x;               // 左
        this.right = this.x + this.width;    // 右
        this.top   = this.y;               // 上
        this.bottom = this.y+this.height;   // 下

        if (this.dir === DIR_RIGHT) {
            if (mainScene.map.hitTest(this.right, this.bottom - 12)) { //地面以外にぶつかった場合
                this.dir = DIR_LEFT;
                this.scaleX = -1;
            } else {
                this.x += 1;
            }
        }
        if (this.dir === DIR_LEFT) {
            if (mainScene.map.hitTest(this.left, this.bottom - 12)) { //地面以外にぶつかった場合
                this.dir = DIR_RIGHT;
                this.scaleX = 1;
            } else {
                this.x -= 1;
            }
        }

        if (mainScene.player.intersect(this)) {
            if (!this.isIntersect) {
                this.isIntersect = true;
                mainScene.player.death();
            }
        }
    },

    // 弾が当たった場合
    onhit: function () {

    }

})

var ScoreUpLabel = Class.create(enchant.ui.MutableText, {

    initialize: function (score) {
        MutableText.call(this);

        this.text = '+' + score;
        this.time = 0;
    },

    onenterframe: function () {
        this.y -= 0.1;
        this.opacity = 1.0 - (this.time/30)

        if (this.time > 30) {
            this.parentNode.removeChild(this)
        }

        this.time += 1;
    }
})

var Coin = Class.create(Sprite, {

    initialize: function (x, y) {
        Sprite.call(this, ITEM_WIDTH, ITEM_HEIGHT)
        this.x = x;
        this.y = y;
        this.image = game.assets[ICON_IMAGE];
        this.frame = COIN_FRAME;

        this.opacity = 1; //不透明度
    },

    onenterframe: function () {
        // console.log("x: "+this.x+" y: "+this.y);
        if (mainScene.player.x < (this.x +8)) {
            if (mainScene.player.x > (this.x -24))
                if (mainScene.player.y < this.y)
                    if (mainScene.player.y > (this.y -32)){
                        var label = new ScoreUpLabel(100)
                        label.moveTo(this.x, this.y)
                        mainScene.stage.addChild(label);
                        // mainScene.scoreLabel.score += (10 * this.opacity);
                        // mainScene.scoreLabel.text = "SCORE : " + mainScene.scoreLabel.score; //スコアを加算(10点)
                        this.opacity = 0; //消す
                    }};

    }
})

var Bullet = Class.create(enchant.Sprite, {
    // 初期化処理
    initialize: function (x, y, direction) {
        Sprite.call(this, MESSAGE_WIDTH, MESSAGE_HEIGHT)
        this.image = game.assets[MESSAGE_IMAGE];
        // label.color = "rgba(255, 123, 213, 1.0)"
        this.backgroundColor = "rgba(0, 0, 0, 0.8)";
        this.x = x;
        this.y = y;
        this.direction = direction
        this.destory = false;
    },

    // 更新処理
    onenterframe: function () {

        this.left = this.x;                // 左
        this.right = this.x + this.width;  // 右
        this.top   = this.y;               // 上
        this.bottom = this.y+this.height;  // 下
        this.centerX = this.left + (BULLET_WIDTH/2)
        this.centerY = this.top + (BULLET_HEIGHT/2)

        if (this.direction === 1) {
            this.x += 2;
        } else if (this.direction === -1)  {
            this.x -= 2;
        }

        //壁にぶつかった場合
        if (mainScene.map.hitTest(this.right, this.centerY) || mainScene.map.hitTest(this.left, this.centerY)) {
            this.parentNode.removeChild(this); // 削除処理
        }

        //敵にぶつかった場合

    }
})

function createVoiceBullet(text, x, y) {
    var bullet = new enchant.Label(text);
    bullet.x = x;
    bullet.y = y;
    bullet.width = 3;
    bullet._style['line-height'] = 0;
    bullet.font = "8px Tahoma";
    bullet.color = "rgb(0, 0, 0)"
    bullet.addEventListener("enterframe", function () {
        bullet.x += 2;
    })

    return bullet;
}












