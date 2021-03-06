;(function($, document, window, undefined){
    function Selector(element, opts) {
        this.sel = element;
        this.defaults = {
            backgroundColor: '#ccc',
            hoverColor: '#037ac3',
            multiple: false,    
            position: 'default',
            speed: 0,
            size: 'default',
            backBtnText: 'back'
        }
        this.settings = $.extend({}, this.defaults, opts)

        this.init()
    }

    Selector.prototype = {
        init: function(){
            console.log('get data successfully!')
            var s = this;  
            
            s.sel.html('')
            s.sel.append('<div class="left-part"><ul></ul></div>')
            s.sel.append('<div class="right-part"><ul></ul></div>')

            s.initData(s)
            s.insertData(s)

            s.bindClickEvent(s)
            s.bindMouseEvent(s)
        },
        initData: function(s){
            s.currFloor = 1
            s.first_floor = []
            s.second_floor = []
            s.third_floor = []
            s.tmpData = []          // To save the second floor data 
            s.fullAddress = []      // The full name of address, like: ['Building A', '3rd Floor', 'Room No.1001']

            for(var i = 0; i < s.settings.data.length; i++){ 
                s.first_floor.push(s.settings.data[i].label)
            }
            
            s.second_floor = s.settings.data[0].children
        },
        insertData: function(s){  
            s.insertLeftData(s)

            s.sel.find('.left-part ul li').eq(0).addClass('btn-active')
            s.fullAddress[0] = s.sel.find('.left-part ul li').eq(0).text()
            s.insertRightData(s)

            if(s.currFloor == 1) s.sel.find('.left-part .back-btn').hide()
        },
        bindClickEvent: function(s){
            $(s.sel.selector).off('click', '.left-part ul li').on('click', '.left-part ul li', function(){
                s.stopPropagation();
                $(this).siblings('li').removeClass('btn-active')
                $(this).addClass('btn-active')
                
                if(s.currFloor == 2){
                    if(s.settings.multiple) s.fullAddress.splice(2, s.fullAddress.length - 2)

                    s.sel.find('.right-part ul').html('')
                    for(var i = 0; i < s.tmpData.length; i++){
                        if($(this).text() == s.tmpData[i].label) {
                            s.second_floor = s.tmpData[i].children
                            s.insertRightData(s, 1)
                        }
                    }
                    s.fullAddress[1] = $(this).text()
                }else{
                    var idx = ''

                    s.fullAddress.push($(this).text())
                    
                    for(var i = 0; i < s.first_floor.length; i++){ 
                        if($(this).text() == s.first_floor[i]) idx = i
                    }

                    s.second_floor = s.settings.data[idx].children
                    s.sel.find('.right-part ul').html('')
                    s.insertRightData(s)

                    s.fullAddress = []
                    s.fullAddress[0] = $(this).text()
                }
            })
            $(s.sel.selector).off('click', '.right-part ul li').on('click', '.right-part ul li', function(){
                s.stopPropagation();
                if(s.currFloor == 2) {
                    if(s.settings.multiple){ 
                        s.fullAddress.push($(this).text())

                        var idx = ''
                    
                        for(var i = 0; i < s.second_floor.length; i++){
                            if($(this).text() == s.second_floor[i]) idx = i
                        }
                        s.sel.find('.right-part ul li').eq(idx).addClass('btn-active')
                        
                        s.getFullAddress(s)
                    }else{
                        s.fullAddress.push($(this).text())
                        s.currFloor++
                        s.getFullAddress(s)
                    }
                }else{
                    var idx = ''
    
                    s.sel.find('.left-part ul').html('') 
                    s.first_floor = []
                    for(var i = 0; i < s.second_floor.length; i++){
                        if($(this).text() == s.second_floor[i].label) idx = i
                        s.first_floor.push(s.second_floor[i].label)
                    }
                    s.insertLeftData(s, 1)
                    
                    s.fullAddress[1] = $(this).text()  
                    s.sel.find('.left-part ul li').eq(idx).addClass('btn-active')

                    s.tmpData = s.second_floor
                    s.sel.find('.right-part ul').html('')
                    
                    for(var i = 0; i < s.second_floor[idx].children.length; i++){
                        s.third_floor.push(s.second_floor[idx].children[i])
                    }
                    s.second_floor = s.third_floor
                    s.insertRightData(s, 1)

                    console.log(s.fullAddress)
                    s.currFloor++  
                    s.setScrollTop(s, idx)
                }
            })
            $('body').on('click', s.sel.selector + ' .left-part .back-btn', function(){
                s.resetData(s)
            })
        },
        setScrollTop: function(s, idx){    // Adjust the position of the left scrollbar
            var ulHeight = s.sel.find('.left-part ul')[0].clientHeight - 55,
                eHeight = s.sel.find('.left-part ul li').eq(idx)[0].clientHeight,       // The height of each item
                eTop = s.sel.find('.left-part ul li').eq(idx)[0].offsetTop,         // The distance from each element to the top
                speed = s.settings.speed,
                posi = s.settings.position

            if(eTop > ulHeight){
                var val;
                switch(posi){
                    case 'top':
                        val = eTop;break;
                    default:
                        val = eTop - (eHeight * 4 + 5 * 4 + eHeight/2 + 5);break;   // Get the middle position by calculation
                }
                s.sel.find('.left-part ul').animate({
                    'scrollTop': val
                }, speed)
            }
        },
        bindMouseEvent: function(s){
            s.sel.on('mouseover mouseout', '.left-part ul li, .right-part ul li', function(){
                if(event.type == "mouseover"){      
                    $(this).css('color', '#fff')
                    $(this).css('backgroundColor', s.settings.hoverColor)
                }else if(event.type == "mouseout"){ 
                    $(this).css('color', '#000')
                    $(this).css('backgroundColor', s.settings.backgroundColor)
                }
            })
        },
        resetData: function(s){     // Reset all data, empty html
            s.initData(s)
            
            s.sel.find('.left-part ul').html('')
            s.sel.find('.right-part ul').html('')

            s.insertData(s)
        },
        insertLeftData: function(s, num){      // Insert data into the left column
            var str = ''
            for(var i = 0; i < s.first_floor.length; i++){
                str = str + '<li><span>' + s.first_floor[i] + '</span></li>'
            }
            s.sel.find('.left-part ul').append(str)
            if(num == 1){   // 1: Need to show the return button 
                if(s.sel.find('.left-part .back-btn').length == 0) { 
                    s.sel.find('.left-part').append('<div class="back-btn"><span>'+ s.settings.backBtnText +'</span></div>')
                }else{
                    s.sel.find('.left-part .back-btn').show()
                }
                s.sel.find('.left-part .back-btn').addClass(s.settings.size + '-btn')
            }
            if(s.settings.size == 'mini') s.addExtraClassName(s)
            s.addBackgroundColor(s)
        },
        insertRightData: function(s, num){     // Insert data into the right column
            var str = ''
            for(var i = 0; i < s.second_floor.length; i++){
                var address = num == 1 ? s.second_floor[i] : s.second_floor[i].label
                str = str + '<li><span>' + address + '</span></li>'
            }
            s.sel.find('.right-part ul').append(str)
            s.addBackgroundColor(s)
        },
        addExtraClassName: function(s){
            s.sel.addClass(s.settings.size + '-container')
            s.sel.find('.left-part').addClass(s.settings.size + '-lp')
            s.sel.find('.right-part').addClass(s.settings.size + '-rp')
        },
        addBackgroundColor: function(s){
            s.sel.find('.left-part ul li').css('backgroundColor', s.settings.backgroundColor)
            s.sel.find('.right-part ul li').css('backgroundColor', s.settings.backgroundColor)
        },
        getFullAddress: function(s){
            var result = []
            result = s.unique(s.fullAddress)
            s.settings.callback(result)

            if(!s.settings.multiple) s.resetData(s)
        },
        stopPropagation: function(){
            if (event.stopPropagation) { // 针对 Mozilla 和 Opera 
                event.stopPropagation(); 
            } else if (window.event) { // 针对 IE 
                window.event.cancelBubble = true; 
            } 
        },
        unique: function (arr) {
            var ret = []
            var hash = {}
        
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i]
                var key = typeof(item) + item
                if (hash[key] !== 1) {
                    ret.push(item)
                    hash[key] = 1
                }
            }
            return ret
        }
    }

    $.fn.cascader = function(opts){
        new Selector($(this), opts)
    }

})(jQuery, document, window)