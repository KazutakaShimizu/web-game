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

var ITEM_WIDTH = 25
var ITEM_HEIGHT = 21

var BULLET_WIDTH = 8
var BULLET_HEIGHT = 8
var BULLET_SPEED = 6

var MESSAGE_WIDTH = 50
var MESSAGE_HEIGHT = 20

var BACKGROUND_WIDTH = 4124;
var BACKGROUND_HEIGHT = 320;

var DEATH00_WIDTH = 45;
var DEATH00_HEIGHT = 45;

var DEATH01_WIDTH = 120;
var DEATH01_HEIGHT = 120;

var PEN_FRAME = 0
var CAMERA_FRAME = 1
var VIDEO_FRAME = 2
var MONEY_FRAME = 3

var game = null;
var mainScene = null;
var clearScene = null;

var PLAYER_IMAGE = "images/testkun10.png";
var ENEMY_IMAGE = "images/enemy06.png";
var ICON_IMAGE = "images/icon0.gif";
var MAP_IMAGE = "images/map3.png";
var ITEM_IMAGE = "images/return.png";
var BACKGROUND_IMAGE = "images/map03.png"
var TITLE_BACKGROUND_IMAGE01 = "images/top01.png"
var TITLE_BACKGROUND_IMAGE02 = "images/top02.png"
var TITLE_BACKGROUND_IMAGE03 = "images/top03.png"
var TITLE_BACKGROUND_IMAGE04 = "images/top04.png"
var TITLE_BACKGROUND_IMAGE05 = "images/top05.png"
var TITLE_BACKGROUND_IMAGE06 = "images/top06.png"

var DEATH00_IMAGE = "images/death00.png";
var DEATH01_IMAGE = "images/death01.png";
var MESSAGE_IMAGE = "images/testmessage.png";

var ASSETS = [
    PLAYER_IMAGE, MAP_IMAGE,
    ITEM_IMAGE, BACKGROUND_IMAGE,
    MESSAGE_IMAGE, ENEMY_IMAGE,
    DEATH00_IMAGE,DEATH01_IMAGE,
    TITLE_BACKGROUND_IMAGE01,
    TITLE_BACKGROUND_IMAGE02,
    TITLE_BACKGROUND_IMAGE03,
    TITLE_BACKGROUND_IMAGE04,
    TITLE_BACKGROUND_IMAGE05,
    TITLE_BACKGROUND_IMAGE06,
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
        console.log("onload");
        // タイトルシーン
        var titleScene = setupTitleScene(game.rootScene);
        // var titleScene = new TitleScene();
        // game.pushScene(titleScene);

        titleScene.addEventListener('touchstart', function() {
            game.removeScene(mainScene);
            mainScene = new MainScene();
            game.replaceScene(mainScene)

            // メインシーン
            // mainScene = new MainScene();
            mainScene.onclear = function () {
                // クリアーシーン
                game.removeScene(mainScene);
                clearScene = new ClearScene();
                game.replaceScene(clearScene);
            }

            mainScene.onGameOver = function () {
                console.log("GameOver !");
                game.popScene();
            }
        });
    },
    game.start();
};

function setupTitleScene(titleScene) {
    var background = new Sprite(BACKGROUND_WIDTH,BACKGROUND_HEIGHT);
    background.image = game.assets[TITLE_BACKGROUND_IMAGE01];
    background.x = 0;
    background.y = 0;
    titleScene.addChild(background);
    return titleScene;
}

var TitleScene = enchant.Class.create(enchant.Scene, {
    onenter: function () {
        this.background = new Sprite(BACKGROUND_WIDTH,BACKGROUND_HEIGHT);
        this.background.image = game.assets[TITLE_BACKGROUND_IMAGE01];
        this.background.x = 0;
        this.background.y = 0;
        this.backgroundNumber = 1;
        this.tick = 0;
        this.addChild(this.background);
    },
    onenterframe: function () {
        if (this.tick % 20 === 0) {
            this.background = new Sprite(BACKGROUND_WIDTH,BACKGROUND_HEIGHT);
            this.background.x = 0;
            this.background.y = 0;
            if (this.backgroundNumber == 1) {
                console.log(1);
                this.background = game.assets[TITLE_BACKGROUND_IMAGE02];
                this.backgroundNumber = 2;
            }else if(this.backgroundNumber == 2){
                console.log(2);
                this.background = game.assets[TITLE_BACKGROUND_IMAGE03];
                this.backgroundNumber = 3;
            }else if(this.backgroundNumber == 3){
                console.log(3);
                this.background = game.assets[TITLE_BACKGROUND_IMAGE04];
                this.backgroundNumber = 4;
            }else if(this.backgroundNumber == 4){
                console.log(4);
                this.background = game.assets[TITLE_BACKGROUND_IMAGE05];
                this.backgroundNumber = 5;
            }else if(this.backgroundNumber == 5){
                console.log(5);
                this.background = game.assets[TITLE_BACKGROUND_IMAGE06];
                this.backgroundNumber = 6;
            }else if(this.backgroundNumber == 6){
                console.log(6);
                this.background = game.assets[TITLE_BACKGROUND_IMAGE01];
                this.backgroundNumber = 1;
            }
            this.addChild(this.background);
        }
        this.tick ++;
    },
})

var MainScene = enchant.Class.create(enchant.Scene, {

    map: null,
    stage: null,
    scoreLabel: null,
    itemLabel: null,
    player: null,

    onenter: function () {
        console.log("mainscene onenter");
        var background = new Sprite(BACKGROUND_WIDTH,BACKGROUND_HEIGHT)
        background.image = game.assets[BACKGROUND_IMAGE]
        background.moveTo(0,0);
        background.onenterframe = function () {}

        //グループ（ステージ）の生成
        this.stage = new Group();
        this.stage.y = 0;
        // mapデータの作成
        this.map = new Map(TILE_WIDTH, TILE_HEIGHT);
        this.map.image = game.assets[MAP_IMAGE];
        var stageData = createMapData();
        this.map.loadData(stageData.map);
        // this.map.loadData(MAP_DATA.map);
        console.log(this.map.width);
        this.scoreLabel = this.setupScoreLabel();
        this.itemLabel = this.setupItemLabel();

        // Playerデータの作成
        this.player = new Player();
        this.stage.addChild(background)
        this.stage.addChild(this.map);
        this.setupEnemy();
        this.setupCoin();
        this.stage.addChild(this.player);
        this.addChild(this.stage);
        this.addChild(this.scoreLabel);
        this.addChild(this.itemLabel);
    },

    onenterframe: function () {
        //ステージのXY座標の指定（カメラ）。つまるところ、ステージの背景を左側に動かしている
        var x = Math.min((game.width  - 16) / 2 - this.player.x, 0);
        // var y = Math.min((game.height - 16) / 2 - this.player.y, 0);
        // console.log("x: "+x+" y: "+y);
        x = Math.max(game.width,  x + this.map.width) - this.map.width;
        // y = Math.max(game.height, y + this.map.height) - this.map.height;
        this.stage.x = x;
    },

    setupEnemy: function () {
        this.stage.addChild(new Enemy2(400,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy1(900,SCREEN_HEIGHT-32-32-10));
        this.stage.addChild(new Enemy2(1100,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy2(1400,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy1(1700,SCREEN_HEIGHT-32-32-10));
        this.stage.addChild(new Enemy2(1800,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy2(2000,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy2(2300,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy1(2500,SCREEN_HEIGHT-32-32-10));
        this.stage.addChild(new Enemy1(3000,SCREEN_HEIGHT-32-32-10));
        this.stage.addChild(new Enemy1(3100,SCREEN_HEIGHT-32-32-10));
        this.stage.addChild(new Enemy2(3200,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy2(3500,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy2(3800,SCREEN_HEIGHT-32-32));
        this.stage.addChild(new Enemy2(3900,SCREEN_HEIGHT-32-32));

    },

    setupCoin: function () {
        this.stage.addChild(new Item(CAMERA_FRAME, 96, 160));
        this.stage.addChild(new Item(VIDEO_FRAME, 433, 164));
        this.stage.addChild(new Item(PEN_FRAME, 844, 202));
        this.stage.addChild(new Item(MONEY_FRAME, 1287, 100));
    },

    setupScoreLabel: function () {
        console.log(0);
        var scoreLabel = new Label("ゴールまで : "+this.map.width - 1500);
        scoreLabel.font = "16px Tahoma";
        scoreLabel.color = "break";
        scoreLabel.x = 10;	// X座標
        scoreLabel.y = 5;	// Y座標
        scoreLabel.score = 0; // スコア値。独自のプロパテイ
        return scoreLabel;

    },

    setupItemLabel: function () {

        var itemLabel = new Label("リターン : 0円");
        itemLabel.font = "16px Tahoma";
        itemLabel.color = "break";
        itemLabel.x = 10;	// X座標
        itemLabel.y = 25;	// Y座標
        itemLabel.score = 0; // スコア値。独自のプロパテイ
        return itemLabel;

    }
})

var ClearScene = enchant.Class.create(enchant.Scene, {
    onenter: function () {
        this.backgroundColor = "#FF0000";
    },
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
        this.y = SCREEN_HEIGHT-32-32;
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

        if (input.up) {
            this.dir = DIR_UP;
            if (mainScene.map.hitTest(this.centerX, this.bottom)) { // キャラクタが地面についている場合、ジャンプさせる
                this.gravity = 13; // 重力値をセット
            }
        }

        // 画面からはみ出ないように制御
        var left = 0;
        if (this.x < left) {
            this.x = left;
        }

        //一番右端まで到達した場合
        if(this.x > (mainScene.map.width-400) && !this.isClear) {
            this.isClear = true;
            this.clear();
        }

        // 穴に落ちた場合
        if (this.y > SCREEN_HEIGHT && !this.isDrop) {
            this.isDrop = true;
            this.moveTo(this.x, SCREEN_HEIGHT-15)
            this.death()
        }

        // ラベルアニメーション
        mainScene.scoreLabel.score = mainScene.map.width - this.x - 396;
        mainScene.scoreLabel.text = "天竺まであと : " + mainScene.scoreLabel.score + "km"; //スコアを加算(10点)

        // アニメーションフレームの指定
        this.tick++;
        if (!input.up && !input.down &&
            !input.left && !input.right) this.tick = 1;//静止
        if (this.tick % 5 === 0) {
            this.frame = this.anim[this.dir * 4 + (this.tick % 4)];
        }
        // console.log("tick: "+this.tick+" tick%4:", this.tick%4);
    },

    showDeath00: function () {
        if (!this.isDeath) {
            this.isDeath = true;
            this.left  = this.x;    // 左
            this.top   = this.y;    // 上
            this.centerX = this.left + (PLAYER_WIDTH/2)
            this.centerY = this.top + (PLAYER_HEIGHT/2)

            this.removeEventListener(Event.ENTER_FRAME, this.showDeath00);
            var death00 = new Sprite(DEATH00_WIDTH, DEATH00_HEIGHT);
            death00.image = game.assets[DEATH00_IMAGE];
            death00.x = this.centerX-(DEATH00_WIDTH/2);
            death00.y = this.centerY-(DEATH00_HEIGHT/2);

            var tick = 1;
            var isf = true;
            mainScene.stage.removeChild(mainScene.player);
            death00.addEventListener(Event.ENTER_FRAME, function () {

                if (isf && tick % 40 === 0) {
                    isf = false;
                    this.remove(death00)
                    var death01 = new Sprite(DEATH01_WIDTH, DEATH01_HEIGHT);
                    death01.image = game.assets[DEATH01_IMAGE];
                    death01.x = death00.x - DEATH00_WIDTH;
                    death01.y = death00.y - DEATH00_HEIGHT;
                    var isf1 = true;
                    death01.addEventListener(Event.ENTER_FRAME, function () {
                        if (isf1 && game.frame % 100 === 0) {
                            isf1 = false;
                            var e = new enchant.Event("GameOver")
                            mainScene.dispatchEvent(e)
                        }
                    })
                    mainScene.stage.addChild(death01);
                }
                tick++;
            })
            mainScene.stage.addChild(death00);

        }
    },

    // 敵にぶつかった時
    death: function () {
        this.removeEventListener(Event.ENTER_FRAME, this.normal); // 一旦Playerのフレーム更新処理を削除
        // this.moveTo(this.x, SCREEN_HEIGHT/2);
        this.addEventListener(Event.ENTER_FRAME, this.showDeath00)
    },
    // Gameをクリアーした時
    clear: function () {
        this.removeEventListener(Event.ENTER_FRAME, this.normal); // 一旦Playerのフレーム更新処理を削除
        // var isOnce = true;
        var tick = 1;
        var jump = 0;
        // フレームごとの処理
        this.frame = 0;
        this.addEventListener(Event.ENTER_FRAME, function () { //Playerのフレーム更新処理を新しく作成
        this.y = SCREEN_HEIGHT-32-32;

        if (this.x < mainScene.map.width - 315) { // 歩かせる処理
            if (tick % 10 === 0) {
                this.x += 5;
                // 画像の切り替え
                if (this.frame == 0) {
                    this.frame = 1;
                }else{
                    this.frame = 0;
                }
            }
        }else{// ジャンプさせる処理
            if(this.x < mainScene.map.width - 210) {
                if (jump > 10) {
                    if (tick % 10 === 0) {
                        this.x += 5;
                        // 画像の切り替え
                        if (this.frame == 0) {
                            this.frame = 1;
                        }else{
                            this.frame = 0;
                        }
                    }
                }else{
                    if (tick % 20 === 0) {
                        if (this.frame == 2) {
                            this.frame = 1;
                            this.y = SCREEN_HEIGHT-32-32;
                        }else{
                            this.frame = 2;
                            this.y = SCREEN_HEIGHT-32-64;
                        }
                        jump ++;
                    }
                }
            }else{
                if (tick % 30 === 0) {
                    clearScene = new ClearScene();
                    game.pushScene(clearScene);
                }
            }
        }
        tick++;

        }.bind(this));
    }
});

var Enemy1 = Class.create(Sprite, {
    // 出現させる座標を引数にとってる
    initialize: function (x, y) {
        Sprite.call(this, ENEMY_WIDTH, ENEMY_HEIGHT)
        this.x = x;
        this.y = y;
        // this.backgroundColor = "rgba(0, 0, 0, 0.8)";
        this.image = game.assets[ENEMY_IMAGE];
        this.frame = 0;
        this.dir = DIR_LEFT;
        this.scaleX = -1;
        this.isUp = true;
        this.isLeft = true
        this.isIntersect = false;
        this.isCheckInitialPosition = false;
    },


    // フレームを描画する時に呼ばれるメソッド
    onenterframe: function () {

        this.left = this.x;               // キャラクターの左端
        this.right = this.x+this.width;    // 右
        this.top   = this.y;               // 上
        this.bottom = this.y+this.height;   // 下
        // console.log("x:"+this.left+"y:"+this.y);

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
                console.log("intersect1");
                mainScene.player.death();
            }
        }

        if (!this.isCheckInitialPosition) {
            if (mainScene.map.hitTest(this.right, this.bottom, this.left, this.top)) {
                this.x -= 30;
            }else{
                this.isCheckInitialPosition = true;
            }
        }
    },

})

var Enemy2 = Class.create(Sprite, {
    initialize: function (x, y) {
        Sprite.call(this, ENEMY_WIDTH, ENEMY_HEIGHT)
        this.x = x;
        this.y = y;
        this.image = game.assets[ENEMY_IMAGE];
        // this.backgroundColor = "rgba(0, 0, 0, 0.9)";
        this.frame = 0;
        this.dir = DIR_LEFT;
        this.scaleX = -1;
        this.isIntersect = false;
        this.isCheckInitialPosition = false;
    },

    onenterframe: function () {
        this.left = this.x;               // 左
        this.right = this.x + this.width;    // 右
        this.top   = this.y;               // 上
        this.bottom = this.y+this.height;   // 下
        // console.log("x:"+this.left+"y:"+this.y);
        if (this.dir === DIR_LEFT) {
            if (mainScene.map.hitTest(this.left, this.bottom - 12)) { //地面以外にぶつかった場合
                this.dir = DIR_RIGHT;
                this.scaleX = 1;
            } else {
                this.x -= 1;
            }
        }
        if (this.dir === DIR_RIGHT) {
            if (mainScene.map.hitTest(this.right, this.bottom - 12)) { //地面以外にぶつかった場合
                this.dir = DIR_LEFT;
                this.scaleX = -1;
            } else {
                this.x += 1;
            }
        }
        if (mainScene.player.intersect(this)) {
            if (!this.isIntersect) {
                this.isIntersect = true;
                console.log("intersect2");
                mainScene.player.death();
            }
        }

        if (!this.isCheckInitialPosition) {
            if (mainScene.map.hitTest(this.right, this.bottom, this.left, this.top)) {
                this.x -= 30;
            }else{
                this.isCheckInitialPosition = true;
            }
        }
    },
})

var ScoreUpLabel = Class.create(enchant.ui.MutableText, {

    initialize: function (score) {
        MutableText.call(this);
        this.text = '+' + score;
        this.time = 0;
        mainScene.itemLabel.score += score;
        mainScene.itemLabel.text = "リターン : " + mainScene.itemLabel.score + "円";
    },

    onenterframe: function () {
        this.y -= 0.1;
        if (this.time > 30) {
            // ラベルアニメーション
            mainScene.stage.removeChild(this)
        }
        this.time += 1;
    }
})

var Item = Class.create(Sprite, {

    initialize: function (frame, x, y) {
        Sprite.call(this, ITEM_WIDTH, ITEM_HEIGHT)
        this.x = x;
        this.y = y;
        this.image = game.assets[ITEM_IMAGE];
        this.frame = frame;
    },

    onenterframe: function () {
        this.left = this.x;               // 左
        this.right = this.x + this.width;    // 右
        this.top   = this.y;               // 上
        this.bottom = this.y+this.height;   // 下
        // console.log("x: "+this.x+" y: "+this.y);
        if (mainScene.player.intersect(this)) {
            var label = new ScoreUpLabel(10000)
            label.moveTo(this.x, this.y)
            mainScene.stage.removeChild(this)
            mainScene.stage.addChild(label);

        }
    }
})

// var Bullet = Class.create(enchant.Sprite, {
//     // 初期化処理
//     initialize: function (x, y, direction) {
//         Sprite.call(this, MESSAGE_WIDTH, MESSAGE_HEIGHT)
//         this.image = game.assets[MESSAGE_IMAGE];
//         // label.color = "rgba(255, 123, 213, 1.0)"
//         this.backgroundColor = "rgba(0, 0, 0, 0.8)";
//         this.x = x;
//         this.y = y;
//         this.direction = direction
//         this.destory = false;
//     },
//
//     // 更新処理
//     onenterframe: function () {
//
//         this.left = this.x;                // 左
//         this.right = this.x + this.width;  // 右
//         this.top   = this.y;               // 上
//         this.bottom = this.y+this.height;  // 下
//         this.centerX = this.left + (BULLET_WIDTH/2)
//         this.centerY = this.top + (BULLET_HEIGHT/2)
//
//         if (this.direction === 1) {
//             this.x += 2;
//         } else if (this.direction === -1)  {
//             this.x -= 2;
//         }
//
//         //壁にぶつかった場合
//         if (mainScene.map.hitTest(this.right, this.centerY) || mainScene.map.hitTest(this.left, this.centerY)) {
//             this.parentNode.removeChild(this); // 削除処理
//         }
//
//         //敵にぶつかった場合
//
//     }
// })

// function createVoiceBullet(text, x, y) {
//     var bullet = new enchant.Label(text);
//     bullet.x = x;
//     bullet.y = y;
//     bullet.width = 3;
//     bullet._style['line-height'] = 0;
//     bullet.font = "8px Tahoma";
//     bullet.color = "rgb(0, 0, 0)"
//     bullet.addEventListener("enterframe", function () {
//         bullet.x += 2;
//     })
//
//     return bullet;
// }












