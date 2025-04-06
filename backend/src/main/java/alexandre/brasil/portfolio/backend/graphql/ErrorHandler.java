package alexandre.brasil.portfolio.backend.graphql;

import java.util.NoSuchElementException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.web.bind.annotation.ControllerAdvice;

import graphql.GraphQLError;

@ControllerAdvice
public class ErrorHandler {
    @GraphQlExceptionHandler
    public GraphQLError handle(DataIntegrityViolationException e) {
        return GraphQLError.newError().errorType(ErrorType.BAD_REQUEST).message("Os dados enviados violam alguma restrição. Revise-os e tente novamente.").build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handle(NoSuchElementException e) {
        return GraphQLError.newError().errorType(ErrorType.NOT_FOUND).message("A entidade solicitada não existe.").build();
    }
}
