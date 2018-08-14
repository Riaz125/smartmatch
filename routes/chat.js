router.get('/chat', function(req, res, next){
	res.render('chat', {title:'Chat'});
});
