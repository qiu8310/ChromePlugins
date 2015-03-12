
var CommentList = React.createClass({
  render: function() {
    return (
      <div className="comment-list">
      Hello, world! I am a CommentList.
      </div>
    );
  }
});

var CommentForm = React.createClass({
  render: function() {
    return (
      <div className="comment-form">
      Hello, world! I am a CommentForm.
      </div>
    );
  }
});

var CommentBox = React.createClass({
  render: function() {
    return (
      <div className="comment-box">
        <h1>Comments</h1>
        <CommentList />
        <CommentForm />
      </div>
    );
  }
});



React.render(
  <CommentBox />,
  document.getElementById('example')
);