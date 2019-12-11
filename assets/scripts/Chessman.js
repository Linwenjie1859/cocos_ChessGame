/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr. Lin
 * @Date: 2019-09-19 20:38:19
 * @LastEditors: Handsome Lin
 * @LastEditTime: 2019-11-29 21:32:38
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
        image: {
            default: null,
            type: cc.Node
        },
    },

    setId: function(id) {
        //id:XYZ，三位数
        //X:代表是否打开,1开启,0未开启
        //Y:代表玩家,0是黑,1是红
        //Z
        this.id = id;
    },

    // onLoad() {},

    playAnimation: function(callback) {
        var self = this;
        var count = 0;
        this.schedule(function() {
            count++;
            self.image.x = count * -70;
            if (count == 16 && callback != null) {
                callback();
            }
        }, 0.2, 15);
    },
    //0down,1up,2left,3right
    // Chessman.js文件改进attach方法
    attach: function(chessGrid, direction, callback) {
        var self = this;
        this.image.y = (1 + direction) * 80;
        this.playAnimation(function() {
            self.move(chessGrid, direction, callback)
        });
    },
    beAttach: function(role, direction, callback) {
        this.image.y = (9 + (role - 1) * 4 + direction) * 80;
        this.playAnimation(callback);
    },
    setRole: function(playerId, roleId) {
        var self = this;
        cc.loader.loadRes("chessman/" + playerId + roleId, cc.SpriteFrame, function(err, spriteFrame) {
            self.image.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            self.image.x = 0;
            self.image.y = 0;
        });
    },
    getRoleId: function() {
        return this.id % 10;
    },
    getPlayerId: function() {
        return Math.floor(this.id / 10) % 10;
    },
    isOpen: function() {
        return Math.floor(this.id / 100) == 1;
    },
    open: function(callback) {
        var self = this;
        this.playAnimation(function() {
            cc.loader.loadRes("chessman/" + self.getPlayerId() + self.getRoleId(), cc.SpriteFrame, function(err, spriteFrame) {
                self.image.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                self.image.x = 0;
                self.image.y = 0;
                self.id = parseInt(self.id)+100;
                // console.log(self.id+"~~~~~~~~~~~");
                if (callback != null)
                    callback();
            });
        })

    },
    setGrid: function(chessGrid) {
        //将棋子的横轴坐标设置和格子坐标一样
        this.node.x = chessGrid.node.x - this.node.width / 2;
        this.node.y = chessGrid.node.y + this.node.height / 2;
    },
    move: function(chessGrid, direction, callback) {
        var self = this;
        self.image.y = (5 + direction) * 80;
        self.playAnimation(function() {
            self.image.x = 0;
            self.image.y = 0;
            if (callback != null) {
                callback();
            }
        });
        var action = cc.moveTo(1.5, chessGrid.node.x - this.node.width / 2, chessGrid.node.y + this.node.height / 2);
        this.node.runAction(action);
    },
    start() {

    },

    // update (dt) {},
});