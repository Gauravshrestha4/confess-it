var mongoose=require('mongoose');
var commentSchema=new mongoose.Schema(
{
	text:String,
	date:Date  
});
module.exports=mongoose.model('Comment',commentSchema);