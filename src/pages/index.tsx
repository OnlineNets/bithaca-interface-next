// Components
import Meta from "@/UI/components/Meta/Meta";

// Layout
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";

const Index = () => {
  return (
    <>
      <Meta />
      <Main>
        <Container>
          <p>Index page</p>
        </Container>
      </Main>
    </>
  );
};

export default Index;
