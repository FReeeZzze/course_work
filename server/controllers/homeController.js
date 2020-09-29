exports.index = (req, res) => {
    console.log('LOG this: ', req.ip);
    res.send('<ul><li><a href="/api/show?name=all" style="text-decoration: none;color:black;">Go to checkout get all</a></li><li><a href="/api/show?name=abonents" style="text-decoration: none;color:black;">Go to checkout get abonents</a></li></ul>');
};
