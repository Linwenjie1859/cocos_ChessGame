/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr. Lin
 * @Date: 2019-09-15 23:28:43
 * @LastEditors: Handsome Lin
 * @LastEditTime: 2019-12-01 12:06:01
 */
// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        //一个正方形格子
        chessGridPrefab: {
            default: null,
            type: cc.Prefab
        },
        //一个棋子
        chessmanPrefab: {
            default: null,
            type: cc.Prefab
        },
        //棋盘节点
        chessGridsNode: {
            default: null,
            type: cc.Node
        },
        //棋子节点
        chessmansNode: {
            default: null,
            type: cc.Node
        },
        //提示行走方
        currentPlayerLabel: {
            default: null,
            type: cc.Label
        },
        //当前回合数
        roundIndex: {
            default: null,
            type: cc.Label
        },
        //到倒计时
        cutDownTime: {
            default: null,
            type: cc.Label
        },
        //黑红方提示
        title: {
            default: null,
            type: cc.Label
        }

    },

    // LIFE-CYCLE CALLBACKS:


    onLoad() {
        let that = this;
        /**
         * 进行数据初始化
         */

        let network = require("NetworkUtils");
        let sendData = [];
     
        sendData['id'] = sessionStorage.getItem('id');
        network.send('game/game/get_game_info', sendData, function (res) {
            var gameInfo = JSON.parse(res);
            console.log(gameInfo);
            
            that.uid1 = gameInfo.data.uid1;
            that.uid2 = gameInfo.data.uid2;
            //设置提示黑方、红方
            that.title.string = sessionStorage.getItem('uid') == that.uid1 ? '黑' : "红";
            //保存最新的时间
            sessionStorage.setItem('update_time', gameInfo.data.update_time);
            //设置倒计时时间 Start
            that.countDown = 20;
            that.schedule(that.limitTimeAnimation, 2);
            //设置倒计时时间 End

            //当前回合数
            that.currentIndex = parseInt(gameInfo.data.round);
            //初始化双方各16个棋子,如有一方棋子为0,游戏结束。
            that.red = 16;
            that.black = 16;
            //设置当前先手者
            that.currentPlayer = gameInfo.data.current_player;
            //最新的更新时间
            that.update_time = gameInfo.data.update_time;
            that.switchCurrentPlayer();
            that.flag = true;
            var str = gameInfo.data.chessboard + "";
            var chessmanIds = str.substring(1, str.length - 1).split(',');

            that.selectedChessGrid = null;
            that.chessGrids = new Array();

            that.typeSCG = null;
            that.typeCG = null

            for (let i = 0; i < 4; i++) {
                that.chessGrids[i] = new Array();
                for (let j = 0; j < 8; j++) {
                    //格子初始化
                    that.chessGrids[i][j] = cc.instantiate(that.chessGridPrefab);
                    var chessGrids = that.chessGrids[i][j].getComponent("ChessGrid");
                    chessGrids.setPosition(i, j);
                    chessGrids.gameScene = that;
                    that.chessGridsNode.addChild(that.chessGrids[i][j]);
                    //棋子初始化
                    that.chessmanNode = cc.instantiate(that.chessmanPrefab);
                    var chessman = that.chessmanNode.getComponent("Chessman");
                    that.chessmansNode.addChild(that.chessmanNode);
                    chessman.setGrid(chessGrids); //将棋子的横轴坐标设置和格子坐标一样
                    chessman.setId(chessmanIds[i * 8 + j]);

                    //将棋子和格子建立联系
                    chessGrids.chessman = chessman;
                }
            }

        }, null);
    },

    //倒计时时间
    limitTimeAnimation() {
        let that = this;
        let network = require("NetworkUtils");
        let sendData = [];
        let typeSelectChess=null;
        let chessGrid=null;


        sendData['id'] = sessionStorage.getItem('id');
        that.countDown = that.countDown - 1; //倒计时每次减1s

        console.log('uid:', sessionStorage.getItem('uid'), " currentPlayer:", this.currentPlayer, " uid1:", this.uid1, " uid2:", this.uid2);

        if (that.countDown <= 0) {
            that.countDown = 20; //双方都将时间重置
            if ((sessionStorage.getItem('uid') == this.uid1 && this.currentPlayer == 1) || (sessionStorage.getItem('uid') == this.uid2 && this.currentPlayer == 0)) {
                return;
            }
            /**********无操作_0************/
            let jsonOperate = {
                type: 0,
            }
            sendData['operate'] = JSON.stringify(jsonOperate);
            that.currentIndex += 1; //回合数加1
            that.switchCurrentPlayer(); //只有操作方进行红黑互换
            sendData['current_player'] = that.currentPlayer; //保存下数据而已
            sendData['round'] = that.currentIndex; //让对手获得回合数
            that.roundIndex.string = 'Round Number :' + that.currentIndex;
            network.send('game/game/updata_info', sendData, function (res) {
                sessionStorage.setItem('update_time', JSON.parse(res).data.update_time); //更新一下sessionStorage中的变量
            }, null)
        } else {
            //只要update_time更新就表示,棋盘有动过或者是已经20s轮到下一个人。
            network.send('game/game/get_game_info', sendData, function (res) {
                let info = JSON.parse(res).data;
                let operate = JSON.parse(info.operate);
               
                if (info.update_time > sessionStorage.getItem('update_time')) {
                    console.log(operate);
                    
                    sessionStorage.setItem('update_time', info.update_time); //更新一下sessionStorage中的变量
             
                    // 开启棋子:type=1 攻击隔壁:type=2 正在移动位置:type=3 翻开炮攻击:type=4 炮攻击:type=5
                    // console.log(this.chessGrids[0][0].getComponent("ChessGrid").chessman);
                    if (operate.type == 1) {
                        that.flag = false;
                        that.chessGrids[operate.row][operate.column].getComponent("ChessGrid").chessman.open(function () {
                            that.flag = true;
                        });
                    }
                    if (operate.type == 2) {
                        // 进行赋值
                        that.flag = false;
                        typeSelectChess = that.chessGrids[operate.row_one][operate.column_one].getComponent("ChessGrid");
                        chessGrid = that.chessGrids[operate.row_two][operate.column_two].getComponent("ChessGrid");
                       
                        that.isWiner(chessGrid.chessman.getPlayerId());
                        typeSelectChess.chessman.attach(chessGrid, typeSelectChess.getDirection(chessGrid), function () {
                            that.flag = true;
                        });
                        chessGrid.chessman.beAttach(typeSelectChess.chessman.getRoleId(), chessGrid.getDirection(typeSelectChess));
                        chessGrid.chessman = typeSelectChess.chessman;
                        typeSelectChess.chessman = null;
                    }
                    if (operate.type == 3) {
                        // 进行赋值
                        that.flag = false;
                        typeSelectChess = that.chessGrids[operate.row_one][operate.column_one].getComponent("ChessGrid");
                        chessGrid = that.chessGrids[operate.row_two][operate.column_two].getComponent("ChessGrid");

                        typeSelectChess.chessman.move(chessGrid, typeSelectChess.getDirection(chessGrid), function () {
                            that.flag = true;
                        });
                        chessGrid.chessman = typeSelectChess.chessman;
                        typeSelectChess.chessman = null;
                    }
                    if (operate.type == 4) {
                        // 进行赋值
                        that.flag = false;
                        typeSelectChess = that.chessGrids[operate.row_one][operate.column_one].getComponent("ChessGrid");
                        chessGrid = that.chessGrids[operate.row_two][operate.column_two].getComponent("ChessGrid");

                        that.isWiner(chessGrid.chessman.getPlayerId());
                        
                        chessGrid.chessman.open(
                           function(){
                                setTimeout(() => {
                                    if(chessGrid.chessman.isOpen()){
                                        typeSelectChess.chessman.attach(chessGrid, typeSelectChess.getDirection(chessGrid), () => {
                                            that.flag = true;
                                        });
                                        chessGrid.chessman.beAttach(typeSelectChess.chessman.getRoleId(), chessGrid.getDirection(typeSelectChess));
                                        chessGrid.chessman = typeSelectChess.chessman;
                                        typeSelectChess.chessman = null;
                                    }
                                }, 1000);
                           }
                        );
                    }
                    if (operate.type == 5) {
                        // 进行赋值
                        that.flag = false;
                        typeSelectChess = that.chessGrids[operate.row_one][operate.column_one].getComponent("ChessGrid");
                        chessGrid = that.chessGrids[operate.row_two][operate.column_two].getComponent("ChessGrid");

                        that.isWiner(chessGrid.chessman.getPlayerId());

                        typeSelectChess.chessman.attach(chessGrid, typeSelectChess.getDirection(chessGrid), () => {
                            that.flag = true;
                        });
                        chessGrid.chessman.beAttach(typeSelectChess.chessman.getRoleId(), chessGrid.getDirection(typeSelectChess));

                        chessGrid.chessman = typeSelectChess.chessman;
                        typeSelectChess.chessman = null; 
                    }

                    //进行红黑对方的输赢判断
                    if (that.red == 0) {
                        that.gNode = cc.find("gNode");
                        that.gNode.winer = 0;
                        cc.director.loadScene('overScene');
                    }
                    if (that.black == 0) {
                        that.gNode = cc.find("gNode");
                        that.gNode.winer = 1;
                        cc.director.loadScene('overScene');
                    }

                    that.countDown = 20; //倒计时重置
                    that.currentIndex = parseInt(info.round); //更新回合数
                    that.roundIndex.string = 'Round Number :' + that.currentIndex;
                    that.switchCurrentPlayer(); //轮到另一个用户
               
                    //设置新的数据....
                }
            }, null)
        }
        this.cutDownTime.string = this.countDown;
    },

    artilleryAttack: function (chessGrid) { //炮兵的攻击范围
        let min, max, flag = 0;
        let row_1 = this.selectedChessGrid.row,
            column_1 = this.selectedChessGrid.column;
        let row_2 = chessGrid.row,
            column_2 = chessGrid.column;
        if (row_1 == row_2) { //两个位于同一行
            min = Math.min(column_1, column_2);
            max = Math.max(column_1, column_2);
        }
        if (column_1 == column_2) { //两个位于同一列
            min = Math.min(row_1, row_2);
            max = Math.max(row_1, row_2);
        }
        for (++min; min < max; min++) {
            //如果同一行,并且中间不是空格子的话
            if (row_1 == row_2 && this.chessGrids[chessGrid.row][min].getComponent("ChessGrid").chessman) flag++;
            //如果同一列,并且中间不是空格子的话
            if (column_1 == column_2 && this.chessGrids[min][chessGrid.column].getComponent("ChessGrid").chessman) flag++;
            if (flag > 1) break;
        }
        return flag;
    },

    isWiner: function (PlayerId) {
        if (PlayerId == 1) {
            this.red--;
        } else {
            this.black--;
        }
    },
    switchCurrentPlayer() {
        //0代表uid1，1代表uid2
        this.currentPlayer = (this.currentPlayer + 1) % 2;
        if (this.currentPlayer == 0) { //uid1
            this.currentPlayerLabel.string = 'Black Please Go';
        } else { //uid2
            this.currentPlayerLabel.string = 'Red Please Go';
        }
    },
    onChessGridClick: function (chessGrid) { //chessGrid保存第二个选中的格子
        //在上面进行数据的赋值操作,随后在最后进去数据提交
        if ((sessionStorage.getItem('uid') == this.uid1 && this.currentPlayer == 1) || (sessionStorage.getItem('uid') == this.uid2 && this.currentPlayer == 0)) {
            return;
        }
        let network = require("NetworkUtils");
        let sendData = [];
        sendData['id'] = sessionStorage.getItem('id');
        sendData['operate'] = '';

        if (!this.flag) return;
        let that = this;

        if (this.selectedChessGrid != null) { //this.selectedChessGrid保存第一个选中一个格子
            this.selectedChessGrid.unSelected();

            if (this.selectedChessGrid == chessGrid) {
                if (chessGrid.chessman != null && !chessGrid.chessman.isOpen()) {
                    // console.log("开启棋子");
                    this.flag = false;
                    chessGrid.chessman.open(function () {
                        that.flag = true;
                    });


                    /**********开启棋子_1************/
                    let jsonOperate = {
                        type: 1,
                        row: chessGrid.row,
                        column: chessGrid.column,
                    }
                    sendData['operate'] = JSON.stringify(jsonOperate);
                    that.currentIndex += 1; //回合数加1
                    that.switchCurrentPlayer(); //只有操作方进行红黑互换
                    sendData['current_player'] = that.currentPlayer; //保存下数据而已
                    sendData['round'] = that.currentIndex; //让对手获得回合数
                    that.roundIndex.string = 'Round Number :' + that.currentIndex;
                    network.send('game/game/updata_info', sendData, function (res) {
                        sessionStorage.setItem('update_time', JSON.parse(res).data.update_time); //更新一下sessionStorage中的变量
                        that.countDown = 20; //倒计时重置
                    }, null)

                }
            } else if (this.selectedChessGrid.isNextTo(chessGrid)) {
                // console.log("当前和目标有上下左右位置关系");
                //当前选中的格子不为空,并且开启
                if (this.selectedChessGrid.chessman != null && this.selectedChessGrid.chessman.isOpen()) {
                    // 旁边的格子不为空并且是开启的状态
                    // console.log("选中的位置开启且不为空");
                    if (chessGrid.chessman != null && this.selectedChessGrid.chessman.getPlayerId() != chessGrid.chessman.getPlayerId()) {
                        //this.selectedChessGrid.chessman.getPlayerId()代表的就是红方和黑方，不是0就是1
                        // console.log("目标位置开启且不为空,并且不是友军");
                        if (chessGrid.chessman.isOpen()) {
                            var selectedRole = this.selectedChessGrid.chessman.getRoleId(); //做缩写代码用前面的简短代码代替后面的，有点像赋值语句
                            var chessRole = chessGrid.chessman.getRoleId(); //PlayerId立场，RoleId大小
                            console.log("selectedRole:", selectedRole, "chessRole:", chessRole);

                            if (this.currentPlayer != this.selectedChessGrid.chessman.getPlayerId()) return;
                            //GameScene.js文件的onChessGridClick()方法中添加:将和兵的攻击关系判断
                            if ((selectedRole == 1 && chessRole == 7) || selectedRole >= chessRole) {
                                if (!(selectedRole == 7 && chessRole == 1)) {
                                    this.flag = false;
                                    // 进行攻击
                                    this.isWiner(chessGrid.chessman.getPlayerId());
                                    this.selectedChessGrid.chessman.attach(chessGrid, this.selectedChessGrid.getDirection(chessGrid), function () {
                                        that.flag = true;
                                    });
                                    chessGrid.chessman.beAttach(this.selectedChessGrid.chessman.getRoleId(), chessGrid.getDirection(this.selectedChessGrid));

                                    chessGrid.chessman = this.selectedChessGrid.chessman;
                                    this.selectedChessGrid.chessman = null;
                                    /**********攻击隔壁_2************/
                                    let jsonOperate = {
                                        type: 2,
                                        row_one: this.selectedChessGrid.row,
                                        column_one: this.selectedChessGrid.column,
                                        row_two: chessGrid.row,
                                        column_two: chessGrid.column,
                                    }
                                    sendData['operate'] = JSON.stringify(jsonOperate);
                                    that.currentIndex += 1; //回合数加1
                                    that.switchCurrentPlayer(); //只有操作方进行红黑互换
                                    sendData['current_player'] = that.currentPlayer; //保存下数据而已
                                    sendData['round'] = that.currentIndex; //让对手获得回合数
                                    that.roundIndex.string = 'Round Number :' + that.currentIndex;
                                    network.send('game/game/updata_info', sendData, function (res) {
                                        sessionStorage.setItem('update_time', JSON.parse(res).data.update_time); //更新一下sessionStorage中的变量
                                        that.countDown = 20; //倒计时重置
                                    }, null)
                                }
                            }
                        }
                    } else if (chessGrid.chessman == null) {
                        //移动
                        if (this.currentPlayer != this.selectedChessGrid.chessman.getPlayerId()) return;
                        that.flag = false;
                        this.selectedChessGrid.chessman.move(chessGrid, this.selectedChessGrid.getDirection(chessGrid), function () {
                            that.flag = true;
                        });
                        chessGrid.chessman = this.selectedChessGrid.chessman;
                        this.selectedChessGrid.chessman = null;

                        /**********正在移动位置_3************/
                        let jsonOperate = {
                            type: 3,
                            row_one: this.selectedChessGrid.row,
                            column_one: this.selectedChessGrid.column,
                            row_two: chessGrid.row,
                            column_two: chessGrid.column,
                        }
                        sendData['operate'] = JSON.stringify(jsonOperate);
                        that.currentIndex += 1; //回合数加1
                        that.switchCurrentPlayer(); //只有操作方进行红黑互换
                        sendData['current_player'] = that.currentPlayer; //保存下数据而已
                        sendData['round'] = that.currentIndex; //让对手获得回合数
                        that.roundIndex.string = 'Round Number :' + that.currentIndex;
                        network.send('game/game/updata_info', sendData, function (res) {
                            sessionStorage.setItem('update_time', JSON.parse(res).data.update_time); //更新一下sessionStorage中的变量
                            that.countDown = 20; //倒计时重置
                        }, null)
                    }
                }
                //GameScene.js文件的onChessGridClick()方法中添加符合炮攻击的情况
            } else if (this.selectedChessGrid.chessman != null && this.selectedChessGrid.chessman.isOpen() && this.selectedChessGrid.chessman.getRoleId() == 2) { //如果是炮的话那么继续
                //符合炮兵攻击
                let CG = chessGrid;
                let SCG = this.selectedChessGrid;
                let CGChessman = chessGrid.chessman;
                let SCGChessman = this.selectedChessGrid.chessman;

                if (this.artilleryAttack(chessGrid) == 1 && chessGrid.chessman != null) {

                    if (this.currentPlayer != this.selectedChessGrid.chessman.getPlayerId()) return;

                    if (!chessGrid.chessman.isOpen()) { //由于利用的是回调,所以参数必须赋值,就算是使用that也不行。
                        that.flag = false;
                        chessGrid.chessman.open(() => {
                            setTimeout(() => { //延时执行攻击
                                // if (SCGChessman.getPlayerId() != CGChessman.getPlayerId()) {
                                SCGChessman.attach(CG, SCG.getDirection(CG));
                                CGChessman.beAttach(SCGChessman.getRoleId(), CG.getDirection(SCG));
                                // }
                                that.flag = true;
                            }, 1000);
                        });
                        /**********翻开炮攻击_4************/
                        let jsonOperate = {
                            type: 4,
                            row_one: this.selectedChessGrid.row,
                            column_one: this.selectedChessGrid.column,
                            row_two: chessGrid.row,
                            column_two: chessGrid.column,
                        }
                        sendData['operate'] = JSON.stringify(jsonOperate);
                        that.currentIndex += 1; //回合数加1
                        that.switchCurrentPlayer(); //只有操作方进行红黑互换
                        sendData['current_player'] = that.currentPlayer; //保存下数据而已
                        sendData['round'] = that.currentIndex; //让对手获得回合数
                        that.roundIndex.string = 'Round Number :' + that.currentIndex;
                        network.send('game/game/updata_info', sendData, function (res) {
                            sessionStorage.setItem('update_time', JSON.parse(res).data.update_time); //更新一下sessionStorage中的变量
                            that.countDown = 20; //倒计时重置
                        }, null)
                    } else {
                        if (this.selectedChessGrid.chessman.getPlayerId() != chessGrid.chessman.getPlayerId()) {
                            that.flag = false;
                            this.selectedChessGrid.chessman.attach(chessGrid, this.selectedChessGrid.getDirection(chessGrid), () => {
                                that.flag = true;
                            });
                            chessGrid.chessman.beAttach(this.selectedChessGrid.chessman.getRoleId(), chessGrid.getDirection(this.selectedChessGrid));
                            /**********炮攻击_5************/
                            let jsonOperate = {
                                type: 5,
                                row_one: this.selectedChessGrid.row,
                                column_one: this.selectedChessGrid.column,
                                row_two: chessGrid.row,
                                column_two: chessGrid.column,
                            }
                            sendData['operate'] = JSON.stringify(jsonOperate);
                            that.currentIndex += 1; //回合数加1
                            that.switchCurrentPlayer(); //只有操作方进行红黑互换
                            sendData['current_player'] = that.currentPlayer; //保存下数据而已
                            sendData['round'] = that.currentIndex; //让对手获得回合数
                            that.roundIndex.string = 'Round Number :' + that.currentIndex;
                            network.send('game/game/updata_info', sendData, function (res) {
                                sessionStorage.setItem('update_time', JSON.parse(res).data.update_time); //更新一下sessionStorage中的变量
                                that.countDown = 20; //倒计时重置
                            }, null)
                        }
                    }
                    // if (this.selectedChessGrid.chessman.getPlayerId() != chessGrid.chessman.getPlayerId()) {
                    this.isWiner(chessGrid.chessman.getPlayerId());
                    chessGrid.chessman = this.selectedChessGrid.chessman;
                    this.selectedChessGrid.chessman = null;
                    // }
                }
            }


            //进行红黑对方的输赢判断
            if (this.red == 0) {
                this.gNode = cc.find("gNode");
                this.gNode.winer = 0;
                cc.director.loadScene('overScene');
            }
            if (this.black == 0) {
                this.gNode = cc.find("gNode");
                this.gNode.winer = 1;
                cc.director.loadScene('overScene');
            }

        }
        console.log("red:", this.red, "——black:", this.black);
        this.selectedChessGrid = chessGrid;
        this.selectedChessGrid.selected();

    },

    start() {

    },

    // update (dt) {},
});