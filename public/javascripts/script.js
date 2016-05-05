$(function()
{
  //what is DRY LOLOL
  $('#showPost').on('click', function()
  {
    $('#addPost').toggle();
  });

  $('.showEdit').on('click', function()
  {
    $('.editPost').toggle();
  });

  $('.showLogin').on('click', function()
  {
    $('.loginForm').toggle();
  });

  $('.showRegister').on('click', function()
  {
    $('.registerForm').toggle();
  });
});
