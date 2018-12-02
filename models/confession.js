var mongoose=require('mongoose');
var confessionSchema= new mongoose.Schema(
{
	category:String,
	description:String,
	like:Number,
	comments:[
	{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Comment'
	}
	]
});
module.exports= mongoose.model('confession',confessionSchema);
