
var express=require('express'),
	app=express(),
	bodyParser=require('body-parser'),
	mongoose=require('mongoose'),
	passport=require('passport');
	LocalStrategy=require('passport-local');
	Confession=require('./models/confession')
	seedDb=require('./seed'),
	Comment=require('./models/comments'),
	User=require('./models/user'),
	flash=require('connect-flash'),
	methodOverride=require('method-override');

mongoose.connect('mongodb://gaurav:Gaurav-1995@ds123584.mlab.com:23584/confessions');



app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());
app.use(express.static(__dirname+'/public'));
app.set("view engine","ejs");


//passport config
app.use(require('express-session')({
	secret:'no one can do it better',
	resave:false,
	saveUninitialised:false
}));

app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// seedDb();
/*Confession.create({
	name:"manali",
	url:"https://www.reserveamerica.com/webphotos/NH/pid270015/0/540x360.jpg"
},function(err,Confession)
{
	if(err){console.log(err);}
	else{
		console.log("Confession added");
		console.log(Confession);
	}
});
*/
app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash('error');
	res.locals.success=req.flash('success');
	next();
});
app.get('/',function(req,res){
			res.redirect('/confessions');
});
app.get('/confessions',function(req,res){
	Confession.find({},function(err,allconfession){
		if(err)console.log(err);
		else{
			res.render('confession/index',{confession:allconfession})
		}
	});
	
});
app.get('/about',function(req,res){
		res.render('about')
	});
app.get('/privacy',function(req,res){
		res.render('privacy')
	});
app.get('/contact',function(req,res){
		res.render('contact')
	});
app.post('/confession',function(req,res){
	var category=req.body.category;
	var desc=req.body.description;
	var like=0;
	var newConf={category:category,description:desc,like:like};
	Confession.create(newConf,function(err,newConfession){
		if(err) console.log(err);
		else{
			console.log(newConfession);
		}
	})
	res.redirect('/confessions');
});

app.get('/confession/new',function(req,res){
	res.render('confession/new');
});

app.get('/confession/:id',function(req,res){
	Confession.findById(req.params.id).populate('comments').exec(function(err,foundConfession){
		if(err) console.log(err)
		else{
			console.log('hey');
			res.render("confession/show",{confession:foundConfession});
		}
	});
	
});
app.get('/confession/:id/edit',checkConfessionOwnership,function(req,res){
	Confession.findById(req.params.id,function(err,foundConfession)
	{
		res.render('Confession/edit',{Confession:foundConfession});
	});
		
});

app.put('/confession/:id',function(req,res){
	Confession.findByIdAndUpdate(req.params.id,req.body.Confession,function(err,updatedConfession){
		if(err){
			res.redirect('/confession');
		}
		else{
			console.log(updatedConfession);
			res.redirect('/confession/'+req.params.id);
		}
	})
});

app.delete('/confession/:id',checkConfessionOwnership,function(req,res){
	Confession.findByIdAndRemove(req.params.id,function(err){
		if(err)res.redirect('/confession');
		else res.redirect('/confession');
	});
});
//comments routes
app.get('/confession/:id/comment/new',function(req,res){
	Confession.findById(req.params.id,function(err,foundConfession){
		if(err)console.log(err);
		else{
			res.render('comments/new',{confession:foundConfession});
		}
	});
	
})

app.post('/confession/:id/comment',function(req,res){
	Confession.findById(req.params.id,function(err,Confession){
		if(err)console.log(err);
		else{
			console.log(Confession);
			Comment.create(req,function(err,comment){
				if(err)console.log(err);
				else{
					console.log(req.body.comment);
					comment.text=req.body.comment.text;
					comment.date=new Date()
					comment.save()
					Confession.comments.push(comment);
					Confession.save();
					res.redirect('/confession/'+Confession._id);
				}

			});
		}
	});
});

app.get('/confesssion/:id/comment/:commentid/edit',checkCommentOwnership,function(req,res){
	var Confession_id=req.params.id;
	Comment.findById(req.params.commentid,function(err,foundComment){
		if(err)
		{
			res.redirect("back");
		}
		else{
			res.render('comments/edit',{Confession_id:Confession_id,comment:foundComment});
		}
	});
	
});

app.put('/confession/:id/comment/:commentid',checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.commentid,req.body.comment,function(err,comment){
		if(err) 
			{
				res.redirect("back");
			}
		else{
			res.redirect('/confession/'+req.params.id);
		}
	});
	
});

app.delete('/confession/:id/comment/:commentid',checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.commentid,function(err){
		if(err) 
			{
				res.redirect("back");
			}
		else{
			res.redirect('/confession/'+req.params.id);
		}
	});
})
// auth routes
/*app.get('/register',function(req,res){
	res.render('register');
});

app.post('/register',function(req,res){
	var newUser=new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err) 
		{ 
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req,res,function(){
			res.redirect('/confession');
		});
	
	});
});*/

/*app.get('/login',function(req,res){
	res.render('login');
});

app.post('/login',passport.authenticate("local",
{
	successRedirect:'/confession',
	failureRedirect:'/login'
}),function(req,res){

});*/

/*app.get('/logout',function(req,res){
	req.logout();
	req.flash('success','you are logged out');
	res.redirect('/confession');
});
*/
/*function(req,res,next)
{
	if(req.isAuthenticated()){
		return next();
	}
	else{
		req.flash('error','please login First!!');
		res.redirect('/login')
	}
}*/
function checkConfessionOwnership(req,res,next)
{
	if(req.isAuthenticated()){
		Confession.findById(req.params.id,function(err,foundConfession){
		if(err)
		{
			res.redirect("back");
		}
		else
		{
			if(req.user._id.equals(foundConfession.author.id))
			{
				next();
			}
			else
			{
				res.redirect("back");
			}
		}
		});
		
	}
	else{
		res.redirect("back");
	}
}
function checkCommentOwnership(req,res,next)
{
	if(req.isAuthenticated()){
		Comment.findById(req.params.commentid,function(err,foundComment){
		if(err)
		{
			res.redirect("back");
		}
		else
		{
			if(req.user._id.equals(foundComment.author.id))
			{
				next();
			}
			else
			{
				res.redirect("back");
			}
		}
		});
		
	}
	else{
		res.redirect("back");
	}
}
app.listen(8000,function(){
console.log("server started");
});	