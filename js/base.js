/**==================================================
  基本数学方法
=====================================================*/
var PI = Math.PI;
var random = Math.random;
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var max = Math.max;
var min = Math.min;
var abs = Math.abs;
var sqrt = Math.sqrt;
var floor = Math.floor;
var ceil = Math.ceil;
var round = Math.round;


/**==================================================
  基本浏览器判断和方法
=====================================================*/
var isMobile = /Android|Windows Phone|iPhone|iPod/i.test(navigator.userAgent);

var touchClick = isMobile ? 'touchstart' : 'click';


/**==================================================
  canvas 设置
=====================================================*/
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var body = document.body;
var wrap = document.getElementById('J_wrap');

var wrapWidth;
var wrapHeight;
  
if( !isMobile ){
  wrapWidth = 320;
  wrapHeight = 568;
  
  setStyle(wrap, {
    margin: '0 auto',
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: '10px',
    width : wrapWidth + "px",
    height : wrapHeight + "px"
  });
  
}else{
  hide('J_wx');
}

var windowWidth = canvas.width = wrapWidth ? wrapWidth : body.clientWidth;
var windowHeight = canvas.height = wrapHeight ? wrapHeight : body.clientHeight;

/**==================================================
  棍子 设置
=====================================================*/
var StickOption = {
  
  // 整个棍子的存储容器
  store : [],
  
  // 哪些棍子在最上面的存储容器
  up : [],
  
  // 棍子的数量
  number : 10,
  
  hardType : {
    'easy' : 10,
    'normal' : 20,
    'hard' : 40
  },
  
  hardTypeMsg : {
    'easy' : '简易',
    'normal' : '普通',
    'hard' : '噩梦'
  },
  
  // 棍子唯一id
  _cid : 0,
  
  // 每根棍子的宽高都是一样的
  width : max(canvas.width, canvas.height) * 2,
  height : 10,
  
  // 模糊边界，因为眼睛不见得看得那么清楚
  step : 5
}


/**==================================================
  点击之后的小圆 设置
=====================================================*/
var CircleOption = {
  r : 15
}


/**==================================================
  其他 设置
=====================================================*/

var OtherOption = {
  // 游戏是否可以玩的参数。为true，说明可以点击
  canPlayKey : true,
  
  // 最大允许的距离，超过这个距离就说明没有碰撞 
  MAXRANGE : CircleOption.r + StickOption.height/2
}

/**==================================================
  基本方法
=====================================================*/

var requestAnimFrame = (function(){
  return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback){
            setTimeout(callback, 1000 / 60);
        };
})();

var myCookie = {
  set : function(name, value){
    var day = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + day*24*60*60*1000);
    document.cookie = name + "=" + escape (value) + ";expires=" + exp.toGMTString();
  },
  
  get : function(name){
    var arrStr = document.cookie.split("; ");
    var i = 0, len = arrStr.length;
    for(; i < len; i++){
      var temp = arrStr[i].split("=");
      if(temp[0] == name) return unescape(temp[1]);
    }
  },

  del : function(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = this.get(name);
    if(typeof cval != "undefined") document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
  }
};

var myStore = (function(){
  if( window.localStorage ){
    return {
      set : function(name, value){
        localStorage.setItem(name, value.toString());
      },
      
      get : function(name){
        return localStorage.getItem(name);
      },
      
      del : function(name){
        localStorage.removeItem(name);
      }
    };
    
  }else{
    return {
      set : function(name, value){
        myCookie.set(name, value.toString());
      },
      
      get : function(name){
        return myCookie.get(name);
      },
      
      del : function(name){
        myCookie.del(name);
      }
    };
  }
  
})();

function getHard(){
  return myStore.get('pick-stick-hard') || StickOption.number;
}

function setHard(hard){
  myStore.set('pick-stick-hard', hard);
}

function getHardType(){
  return myStore.get('pick-stick-hardType') || 'easy';
}

function setHardType(type){
  myStore.set('pick-stick-hardType', type);
}

function show(elem){
  elem = typeof elem === "string" ? document.getElementById(elem) : elem;
  elem.style.display = "block";
}

function hide(elem){
  elem = typeof elem === "string" ? document.getElementById(elem) : elem;
  elem.style.display = "none";
}

function domReady(func){
  document.addEventListener('DOMContentLoaded', function(){
    func && func();
  }, false);
}

function setStyle(elem, obj){
  for(var i in obj){
    if( obj.hasOwnProperty(i) ){
      elem['style'][i] = obj[i];
    }
  }
}

//动态加载css
function loadStyle(cssStr) {
  var style = document.createElement("style");
  style.setAttribute('type', 'text/css');
  style.appendChild(document.createTextNode(cssStr));
  
  var head = document.head || body;
  head.appendChild(style);
}

function isNumeric(obj){
  return typeof obj === 'number' && obj - parseFloat( obj ) >= 0;
}

function clearCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function fadeOut(dom, callback){
  dom = typeof dom == 'string' ? document.getElementById(dom) : dom;
  var cur = 1;
  var step = 0.1;
  
  function fn(){
    
    if( cur < 0  ){
      callback && callback(dom);
      return;
    }
    
    cur -= step;
    
    dom.style.opacity = cur;
    
    setTimeout(function(){
      
      fn();
      
    }, 50);
    
  }
  
  fn();
  
}

/**
  得到渐变色
  @n [1, 8] 区间
*/
function getLinearGradientStyle(x1, y1, x2, y2, n){
  n = (n>=1 && n<=8) ? n : _.random(1,8);
  
  var g = ctx.createLinearGradient(x1, y1, x2, y2);
  
  switch(n){
    case 1:
      g.addColorStop(0, '#5b7f05'); 
      g.addColorStop(0.5, '#addd3a');
      g.addColorStop(1, '#5b7f05');
      break;
    case 2:
      g.addColorStop(0, '#ffc100'); 
      g.addColorStop(0.5, '#c0eb59');
      g.addColorStop(1, '#ffc100');
      break;
    case 3:
      g.addColorStop(0, '#f928ff'); 
      g.addColorStop(0.5, '#e584fa');
      g.addColorStop(1, '#f928ff');
      break;
    case 4:
      g.addColorStop(0, '#693812'); 
      g.addColorStop(0.5, '#b46c2f');
      g.addColorStop(1, '#693812');
      break;
    case 5:
      g.addColorStop(0, '#235959'); 
      g.addColorStop(0.5, '#48b0b0');
      g.addColorStop(1, '#235959');
      break;
    case 6:
      g.addColorStop(0, '#C48915'); 
      g.addColorStop(0.5, '#F1BF5D');
      g.addColorStop(1, '#C48915');
      break;
    case 7:
      g.addColorStop(0, '#2414BF'); 
      g.addColorStop(0.5, '#8272FE');
      g.addColorStop(1, '#2414BF');
      break;
    case 8:
      g.addColorStop(0, '#9C184A'); 
      g.addColorStop(0.5, '#F779AF');
      g.addColorStop(1, '#9C184A');
      break;  
  }
  
  return g;
}

// 针对浮点数相等的精度判断
function isEqual(a, b){
  return abs(a - b) <= 0.001;
}

// 角度 -> 弧度
function degToRad(deg){
  return deg * PI / 180;
}

// 得到浮点，可以设置精度
function getFloat(num){
  return +parseFloat(num, 10).toFixed(3);
}

/**
  判断一个点是否在画布里面
  在里面就返回true，不在就返回false
*/
function isInCanvas(x,y){
  var w = canvas.width - StickOption.step;
  var h = canvas.height - StickOption.step;
      
  return !(x<=0 || x>=w || y<=0 || y>=h);
}


/**
  给出两条线段它们两边的坐标，判断它们是否相交
  相交就返回相交的那个点的坐标，不相交就返回false
*/
function isLineCross(Ax1,Ay1,Ax2,Ay2,Bx1,By1,Bx2,By2){
  var AK = getFloat( (Ay2-Ay1)/(Ax2-Ax1) ),
      BK = getFloat( (By2-By1)/(Bx2-Bx1) );
  
  //平行
  if( isEqual(AK, BK) ) return false;
  
  //相交的点坐标
  var x = getFloat( (By1-Bx1*BK+Ax1*AK-Ay1)/(AK-BK) ),
      y = getFloat( By1+BK*(x-Bx1) ),
  
      //判断x，y是不是在一条线段上
      //假设在A线段上
      AxMax = max(Ax1, Ax2),
      AxMin = min(Ax1, Ax2);
  
  //相交点不在线段上，或者它不在容器里面
  if(x > AxMax-StickOption.step || x < AxMin+StickOption.step || !isInCanvas(x,y)) return false;
  
  return {
    x:x,
    y:y
  };

}


//比较两个stick是否相交，并且相交点要在容器里面
//相交返回true，否则返回false
function compareStick(A, B){
 
  return !!isLineCross(A.line.x1, A.line.y1, A.line.x2, A.line.y2, 
                        B.line.x1, B.line.y1, B.line.x2, B.line.y2);
  
}

// 知道一线中一个点的左边，和相对水平线来说，顺时针的角度
// 得到包裹它已知容器矩形相交2点的坐标
// 而且得知，直线不可能是水平（排除了水平状态）
function getLineBoxAcrossCoordinate(x, y, rad, box_w, box_h){
  
  var ret = {};
  
  var temp1 = {};
  var temp2 = [];
  
  if( rad == PI/2 ){
    ret.x1 = x;
    ret.y1 = 0;
    
    ret.x2 = x;
    ret.y2 = box_h;
    
    return ret;
  }
  
  // 先变换一下坐标系
  x = x;
  y = box_h - y;
  
  //直线的斜率 [切线与x轴正方向的夹角tanα]
  var k = tan(PI - rad);
  
  //根据直线的斜截式方程：y=kx+b
  var b = y - k * x;
  
  /* 
    直线方程 与 矩形4边 求交点，如果在矩形范围内，就加入ret
    A: x = 0
    B: y = box_h
    C: x = box_w
    D: y = 0
    矩形4边直线方程
  */

  // 与4条边延长直线都相交后，会等到4个交点
  temp1.Ax = 0;
  temp1.Ay = b;
  
  temp1.Bx = (box_h - b) / k;
  temp1.By = box_h;
  
  temp1.Cx = box_w;
  temp1.Cy = k * box_w + b;
  
  temp1.Dx = -b / k;
  temp1.Dy = 0;
    
  // 判断相交的点是否都符合条件（在矩形上面）
  // 可以肯定的是，必有2个焦点在矩形上面，2个不在
  if( temp1.Ay >= 0 && temp1.Ay <= box_h ){
    temp2.push([temp1.Ax, temp1.Ay]);
  }
  
  if( temp1.Bx > 0 && temp1.Bx < box_w ){
    temp2.push([temp1.Bx, temp1.By]);
  }
  
  if( temp1.Cy >=0 && temp1.Cy <= box_h ){
    temp2.push([temp1.Cx, temp1.Cy]);
  }
  
  if( temp1.Dx > 0 && temp1.Dx < box_w ){
    temp2.push([temp1.Dx, temp1.Dy]);
  }
    
  // 在把坐标系换回来
  if( temp2[0] ){
    ret.x1 = temp2[0][0];
    ret.y1 = box_h - temp2[0][1];
  }
  
  if( temp2[1] ){
    ret.x2 = temp2[1][0];
    ret.y2 = box_h - temp2[1][1];
  }

  return ret;
}


/**==================================================
  页面交互
=====================================================*/

/*常用dom*/
var domElem = {
  
  za : document.getElementById("J_za"),
  zb : document.getElementById("J_zb"),
  
  cover_page : document.getElementById("J_cover_page"),
  start_game_btn : document.getElementById("J_start_game_btn"),
  setting_btn : document.getElementById("J_setting_btn"),
  $setting_btn_ico : $("#J_setting_btn .ico-setting"),
  
  setting_page : document.getElementById("J_setting_page"),
  setting_back_btn : document.getElementById("J_setting_back_btn"),
  
  game_success_tip : document.getElementById("J_game_success_tip"),
  game_again_btn : document.getElementById("J_game_again_btn"),
  back_to_index_btn : document.getElementById("J_back_to_index_btn"),
  
  score_wrap : document.getElementById("J_score_wrap"),
  $time : $('#J_score_wrap .time'),
  time_sec : document.getElementById("J_time_sec"),
  time_msec : document.getElementById("J_time_msec"),
  score : document.getElementById("J_score"),
  
  $tipBox : $('.game-success-tip-box'),
  $tipBoxScore : $('.game-success-tip-box .game-data .score-item p span'),
  $tipBoxHard : $('.game-success-tip-box .game-data .score-item p strong'),
  $tipBoxTime : $('.game-success-tip-box .game-data .time-item p')
}

/*页面行为*/
var pageAction = {
  coverPage : {
    hide : function(){
      setStyle(domElem.cover_page, {
        top : -1 * windowHeight + 'px'
      });
    },
    
    show : function(){
      setStyle(domElem.cover_page, {
        top : 0
      });
    }
  },

  settingPage : {
    hide : function(){
      setStyle(domElem.setting_page, {
        left : windowWidth + 'px'
      });
    },
    
    show : function(){
      setStyle(domElem.setting_page, {
        left : 0
      });
    }
  },

  zA : {
    hide : function(){
      setStyle(domElem.za, {
        top : -1 * windowHeight + 'px'
      });
    },
    
    show : function(){
      setStyle(domElem.za, {
        top : 0
      });
    }
  },

  gameSuccessTip : {    
    record : function(hardType, stick, time){
      stick = stick || 0;
      time = time || 0;
      
      var $p = $('#J_my_score').find('.'+hardType);
      
      var history_time =  +myStore.get('pick-stick-hardType-' + hardType + '-time') || 0;
      var history_stick = +myStore.get('pick-stick-hardType-' + hardType + '-stick') || 0;
      
      var nice_time = history_time;
      var nice_stick = history_stick;
      
      if( stick > history_stick ){
        nice_stick = stick;
        nice_time = time;
      }else if( stick == history_stick ){
        nice_stick = stick;
        
        if( time < history_time ){
          nice_time = time;
        }
      }
      
      $p.html( StickOption.hardTypeMsg[hardType]+'：'+ nice_stick +'棍 / '+ nice_time +'秒' );
      
      myStore.set('pick-stick-hardType-' + hardType + '-stick', nice_stick);
      myStore.set('pick-stick-hardType-' + hardType + '-time', nice_time);
    },
    
    show : function(){
      var self = this;
      
      // 记录成绩
      var hardType = getHardType();
      var time = $.trim( domElem.$time.text() );
      var stick = domElem.score.innerHTML;
      
      domElem.$tipBoxHard.html(  getHard() );
      domElem.$tipBoxScore.html( domElem.score.innerHTML );
      
      domElem.$tipBoxTime.html( time );
      
      // 判断并写入最佳成绩
      self.record( hardType, stick, parseFloat(time));
      
      show(domElem.game_success_tip);
      
      domElem.$tipBox.addClass('game-success-tip-box-show');
    },
    
    hide : function(){
      hide(domElem.game_success_tip);
      domElem.$tipBox.removeClass('game-success-tip-box-show');
    }
  },
  
  recordInit : function(){
    var self = this;
    
    for(var i in StickOption.hardType){
      if( StickOption.hardType.hasOwnProperty(i) ){
        self.gameSuccessTip.record(i);
      }
    }
  },
  
  // 游戏成功后
  gameSuccess : function(){
    this.gameSuccessTip.show();
  },
  
  // 再来一次
  gameAgain : function(){
    this.gameSuccessTip.hide();
    
    show(domElem.score_wrap);
    
    Game.start();
  },
  
  // 回到首页 
  backToIndex : function(){
    this.zA.show();
    
    hide(domElem.game_success_tip);
    show(domElem.score_wrap);
  }
}

pageAction.recordInit();

// 重置一些样式
loadStyle('\
  .z, .page{\
    width: '+ windowWidth +'px;\
    height:'+ windowHeight +'px;\
  }\
  .setting-page{\
    left:'+ windowWidth +'px;\
  }\
');

// 这里之所以要延迟添加 transition，就是因为上面的宽高是动态添加的
setTimeout(function(){
  loadStyle('\
    .z, .page{\
      transition: all 0.3s ease 0s;\
      -webkit-transition: all 0.3s ease 0s;\
      -moz-transition: all 0.3s ease 0s;\
    }\
  ');
}, 100);


// 游戏难度设置
var GameDifficultySetting = {
  $btns : $("#J_difficulty_setting .btn"),
  
  init : function(){
    var self = this;
    
    StickOption.number = +getHard();
    
    self.$btns.on(touchClick, function(){
      self.$btns.removeClass("btn-solid");
      $(this).addClass("btn-solid");
      
      var hardType = $(this).attr("data-hardType");
      
      StickOption.number = StickOption.hardType[hardType];
      
      myStore.set('pick-stick-hard', StickOption.number);
      myStore.set('pick-stick-hardType', hardType);
    });
    
    self.$btns.removeClass("btn-solid");
    
    self.$btns.each(function(){
      
      if( $(this).attr("data-hardType") == getHardType() ){
        $(this).addClass("btn-solid");
      }
    });

  }
}

GameDifficultySetting.init();


// 开始游戏
domElem.start_game_btn.addEventListener(touchClick, function(e){
  pageAction.zA.hide();
  
  Game.start();
}, false);

// 打开设置
domElem.setting_btn.addEventListener(touchClick, function(e){
  var $ico = $(this).find(".ico");
  
  // 关闭设置
  if( domElem.$setting_btn_ico.hasClass('ico-setting-back') ){
    pageAction.settingPage.hide();
    domElem.$setting_btn_ico.removeClass('ico-setting-back');
  }
  
  // 打开设置
  else{
    pageAction.settingPage.show();
    domElem.$setting_btn_ico.addClass('ico-setting-back');
  }
  
}, false);

// 再来一局
domElem.game_again_btn.addEventListener(touchClick, function(e){
  pageAction.gameAgain();
}, false);

// 返回首页
domElem.back_to_index_btn.addEventListener(touchClick, function(e){
  pageAction.backToIndex();
}, false);

// 禁止页面滚动
body.addEventListener('touchmove', function(e){
  e.preventDefault();
}, false);

// fix 微信快速点击2次
body.addEventListener('touchstart', function(e){
  e.preventDefault();
}, false);

// 判断横竖屏
var changeEvt = "onorientationchange" in window ? "orientationchange" : "resize";

if(isMobile){
   window.addEventListener(changeEvt, function(){
       location.reload();
    }, false); 
}

window.addEventListener('load', function(){
  
  setTimeout(function(){
    fadeOut('J_game_loading', function(d){
      $(d).remove();
    });
  }, 1000);
  
}, false);


