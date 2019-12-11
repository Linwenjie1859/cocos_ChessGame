/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr. Lin
 * @Date: 2019-09-15 23:24:59
 * @LastEditors: Mr. Lin
 * @LastEditTime: 2019-09-29 10:51:06
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
        background: {
            default: null,
            type: cc.Node
        }
    },


    setPosition: function(row, column) {
        this.row = row;
        this.column = column;
        this.node.y = row * 85 - 170 + 42.5;
        this.node.x = column * 85 - 340 + 42.5;
    },
    onLoad() {
        this.node.on('click', function() {
            this.gameScene.onChessGridClick(this);
        }, this);
    },
    selected: function() {
        this.background.opacity = 255;
    },
    unSelected: function() {
        this.background.opacity = 180;
    },
    start() {

    },
    //判断相邻
    isNextTo: function(chessGrid) {
        if (this.row == chessGrid.row && Math.abs(this.column - chessGrid.column) == 1) {
            // console.log("数据row：" + this.row, chessGrid.row);
            return true;
        }
        if (this.column == chessGrid.column && Math.abs(this.row - chessGrid.row) == 1) {
            // console.log("数据column：" + this.column, chessGrid.column);
            return true;
        }
        return false
    },

    //0down,1up,2left,3right
    getDirection: function(chessGrid) {
        if (this.row == chessGrid.row) {
            if (this.column > chessGrid.column) {
                return 2;
            } else {
                return 3
            }
        } else {
            if (this.row > chessGrid.row) {
                return 0;
            } else {
                return 1;
            }
        }

    }

})