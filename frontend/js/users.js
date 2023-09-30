let roles = {};
let users = {};

const getRoles = async () => {
  try {
    const response = await axios.get(`${APIpath}/role`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    roles = [...response.data.data.items].reduce((acc, curr) => {
      return { ...acc, [curr.name]: curr };
    }, {});

    console.log(roles);
  } catch (error) {
    console.error(error);

    if (
      (error.response && error.response.status === 401) ||
      error.response.status === 403
    ) {
      window.location.href = "login.html";
    }
  }
};

getRoles();

const getUsers = async () => {
  try {
    const response = await axios.get(`${APIpath}/user/list`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    users = [...response.data.data.items];
  } catch (error) {
    console.error(error);

    if (
      (error.response && error.response.status === 401) ||
      error.response.status === 403
    ) {
      window.location.href = "login.html";
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  getRoles();
  getUsers();
});
