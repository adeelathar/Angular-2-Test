// JavaScript Document
var windowData	=	{
	width	: $(window).width(),
	height	: $(window).height(),
}
var cachedObjects	=	{
	header	: $('.header_chat'),
	info	: $('.self_details'),
	chatBody: $('.chat_bodys'),	
	chatList: $('.online_members_list'),
}
$(document).ready(function(e) {
	var membersList = cachedObjects.chatBody.find('.online_members_list');
		membersCount = parseInt(membersList.length);
		
		for(var i=0; i<membersCount; i++) {
			$(membersList[i]).attr({
				'data-chatId' : 'chatEnrolledID_'+i,
			});
		}
	
    cachedObjects.header.click(function(){
		cachedObjects.info.add(cachedObjects.chatBody).toggle();
		var chat_build	=	buildChatbox();
		$('body').append(chat_build);
	});
});
function buildChatbox(){
	var build	=	'<div class="chat_box_ind"><div class="header_chat_box"><div class="body_cht_box_ind"></div><div class="footer_chatbox_ind"></div></div></div>';
	return build;
}
function supplyChatBox(){
	
}
function adjChatBox(w,h){
	if(w < 1300){
		
	}
}