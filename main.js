enchant();

var DIR_LEFT  = 0;
var DIR_RIGHT = 1;
var DIR_UP    = 2;
var DIR_DOWN  = 3;

var SCREEN_WIDTH = 640
var SCREEN_HEIGHT = 320

var PLAYER_WIDTH = 32
var PLAYER_HEIGHT = 32

var ENEMY_WIDTH = 32
var ENEMY_HEIGHT = 32

var TILE_WIDTH = 16
var TILE_HEIGHT = 16
var ITEM_WIDTH = 16
var ITEM_HEIGHT = 16

var BULLET_WIDTH = 8;
var BULLET_HEIGHT = 8;
var BULLET_SPEED = 6;

var COIN_FRAME = 14

var game = null;
var player = null;
var map = null;
var stage = null;
var scoreLabel = null;

var PLAYER_IMAGE = "images/chara1.png";
var MAP_IMAGE = "images/map2.png";
var ICON_IMAGE = "images/icon0.gif";

var ASSETS = [
    PLAYER_IMAGE, MAP_IMAGE,
    ICON_IMAGE
];

window.onload = function() {
    //ゲームオブジェクトの生成
    game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);

    //画像の読み込み
    game.preload(ASSETS);

    // スコアを表示するラベルを作成
    scoreLabel = new Label("SCORE : 0");
    scoreLabel.font = "16px Tahoma";
    scoreLabel.color = "break";
    scoreLabel.x = 10;	// X座標
    scoreLabel.y = 5;	// Y座標
    scoreLabel.score = 0; // スコア値。独自のプロパテイ

    game.rootScene.addChild(scoreLabel);
    game.fps = 50 // 一秒間に50回描画

    //ロード完了時に呼ばれる
    game.onload = function() {
        //マップの生成
        var scene = game.rootScene

        scene.onenter = function () {

            // mapデータの作成
            map = new Map(TILE_WIDTH, TILE_HEIGHT);
            map.image = game.assets[MAP_IMAGE];
            map.loadData(STAGE01.map);

            player = new Player();

            //グループ（ステージ）の生成
            stage = new Group();
            stage.addChild(map);
            setupEnemy();
            setupCoin();
            stage.addChild(player);
            scene.addChild(stage);
        }

        //シーンの定期処理
        scene.onenterframe = function () {

            //ステージのXY座標の指定（カメラ）。つまるところ、ステージの背景を左側に動かしている
            var x = Math.min((game.width  - 16) / 2 - player.x, 0);
            var y = Math.min((game.height - 16) / 2 - player.y, 0);
            // console.log("x: "+x+" y: "+y);
            x = Math.max(game.width,  x + map.width) - map.width;
            y = Math.max(game.height, y + map.height) - map.height;
            stage.x = x;
            stage.y = y;

        }
    };

    game.start();
};


var Player = Class.create(Sprite, {

    initialize: function () {
        Sprite.call(this, PLAYER_WIDTH, PLAYER_HEIGHT)
        this.image = game.assets[PLAYER_IMAGE];
        this.frame = 0;
        this.x = 2 * 4;
        this.y = SCREEN_HEIGHT-32-32-32-32;
        this.dir   = DIR_DOWN;
        this.anim  = [
            0,  1,  2,  1, //左
            0,  1,  2,  1, //右
            0,  0,  0,  0, //上
            0,  0,  0,  0  //下
        ];
        this.isDrop = false;

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
        this.top   = this.y;               // 上
        this.bottom = this.y+this.height;   // 下
        this.centerX = this.left + (PLAYER_WIDTH/2)
        this.centerY = this.top + (PLAYER_HEIGHT/2)

        if (this.gravity > 0) { // 上に向かう（ジャンプ中）

            this.y -= this.gravity; // 一旦キャラクターを重力値分だけ、上に移動させる
            //console.log(this.gravity);

            if (map.hitTest(this.centerX, this.top)) { // ジャンプ中に天井（障害物）にぶつかった場合、

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

            if (!map.hitTest(this.centerX, this.bottom)) { // 地面にぶつからなかった場合、下に落ちる(食い込み防止)
                this.y += 1;
            }
            if (!map.hitTest(this.centerX, this.bottom)) { // 地面にぶつからなかった場合、下に落ちる
                this.y += 3;
            }
        }

        var input = game.input

        if (input.up) {
            this.dir = DIR_UP;
            if (map.hitTest(this.centerX, this.bottom)) { // キャラクタが地面についている場合、ジャンプさせる
                this.gravity = 13; // 重力値をセット
            }
        }

        //左へ移動
        if (input.left) {
            this.dir = DIR_LEFT;
            if (!map.hitTest(this.left, this.centerY)){ //左の生涯物にぶつからなかった場合、左に移動する
                this.x -= 4;
            }
            this.scaleX = -1;
        }

        //右へ移動
        if (input.right) {
            this.dir = DIR_RIGHT;
            if (!map.hitTest(this.right-1, this.centerY)){ //右の生涯物にぶつからなかった場合、右に移動する
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
        if(this.x > (map.width-PLAYER_WIDTH)) {
            this.clear();
        }

        // 穴に落ちた場合
        if (this.y > SCREEN_HEIGHT + 50 && !this.isDrop) {
            this.isDrop = true;
            this.death()
        }

        //弾を出す
        if (game.frame % 50 === 0) {
            var bullet = new Bullet(this.centerX, this.centerY, this.scaleX);
            stage.addChild(bullet);
        }

        // アニメーションフレームの指定
        this.tick++;
        if (!input.up && !input.down &&
            !input.left && !input.right) this.tick = 1;//静止
        this.frame = this.anim[this.dir * 4 + (this.tick % 4)];
        // console.log("tick: "+this.tick+" tick%4:", this.tick%4);
    },

    // 敵にぶつかった時
    death: function () {
        this.removeEventListener(Event.ENTER_FRAME, this.normal); // 一旦Playerのフレーム更新処理を削除
        var v = 1;
        var tick = 0;
        this.frame = 3;
        this.moveTo(this.x, SCREEN_HEIGHT/2);

        this.addEventListener(Event.ENTER_FRAME, function () { //Playerのフレーム更新処理を新しく作成
            if (tick % 3 === 0 && v < 4) {
                v++;
                this.scale(v, v);
            }
            tick++;
        })
    },

    // Gameをクリアーした時
    clear: function () {
        this.removeEventListener(Event.ENTER_FRAME, this.normal); // 一旦Playerのフレーム更新処理を削除
        this.addEventListener(Event.ENTER_FRAME, function () { //Playerのフレーム更新処理を新しく作成
            console.log("Clear!");
        })
    }

});

var Enemy = Class.create(Sprite, {

    initialize: function (x, y) {
        Sprite.call(this, ENEMY_WIDTH, ENEMY_HEIGHT)
        this.x = x;
        this.y = y;
        this.image = game.assets[PLAYER_IMAGE];
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
            if (map.hitTest(this.right, this.bottom - 12)) { //地面以外にぶつかった場合
                this.dir = DIR_LEFT;
                this.scaleX = -1;
            } else {
                this.x += 1;
            }
        }
        if (this.dir === DIR_LEFT) {
            if (map.hitTest(this.left, this.bottom - 12)) { //地面以外にぶつかった場合
                this.dir = DIR_RIGHT;
                this.scaleX = 1;
            } else {
                this.x -= 1;
            }
        }

        if (player.intersect(this)) {
            if (!this.isIntersect) {
                this.isIntersect = true;
                player.death();
            }
        }
    },

    // 弾が当たった場合
    onhit: function () {

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
        if (player.x < (this.x +8)) {
            if (player.x > (this.x -24))
                if (player.y < this.y)
                    if (player.y > (this.y -32)){
                        scoreLabel.score += (10 * this.opacity);
                        scoreLabel.text = "SCORE : " + scoreLabel.score; //スコアを加算(10点)
                        this.opacity = 0; //消す
                    }};

    }
})

var Bullet = Class.create(Sprite, {
    // 初期化処理
    initialize: function (x, y, direction) {
        Sprite.call(this, BULLET_WIDTH, BULLET_HEIGHT)
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
            this.x += BULLET_SPEED;
        } else if (this.direction === -1)  {
            this.x -= BULLET_SPEED;
        }

        //壁にぶつかった場合
        if (map.hitTest(this.right, this.centerY) || map.hitTest(this.left, this.centerY)) {
            this.parentNode.removeChild(this); // 削除処理
        }

        //敵にぶつかった場合

    }
})

function setupEnemy() {
    stage.addChild(new Enemy(655,SCREEN_HEIGHT-32-32-32-32));
}

function setupCoin() {
    stage.addChild(new Coin(96,144));
    stage.addChild(new Coin(112,144));
    stage.addChild(new Coin(80,160));
}