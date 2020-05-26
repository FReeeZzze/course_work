exports.editString = (param, slash, start, count) => {
    return param
        .split(slash)
        .splice(start, count)
        .join(slash);
};
