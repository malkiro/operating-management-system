package lk.bitproject.configuration;



import lk.bitproject.service.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private MyUserDetailsService userDetailsService;



    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
                .userDetailsService(userDetailsService)
                .passwordEncoder(bCryptPasswordEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http.
                authorizeRequests()
                .antMatchers("/").permitAll()
                .antMatchers("/resourse/**").permitAll()
                .antMatchers("/login").permitAll()
                .antMatchers("/registration").permitAll()
                .antMatchers("/config","/user/getAdmin").permitAll()


               //  .antMatchers("/user/**","/employee/**","/customer/**","/item/**","/supplier/**","/porder/**","/spayment/**").hasAnyAuthority("ADMIN","MANAGER")
                .antMatchers("/mainwindow","/user/**").hasAnyAuthority("ADMIN","MANAGER","OWNER","STOCK KEEPER","DELIVERY AGENT","SALES REP")
                .antMatchers("/privilage/**","/employee/**").hasAnyAuthority("ADMIN","MANAGER","OWNER","STOCK KEEPER","DELIVERY AGENT","SALES REP").anyRequest().authenticated()
                .and().csrf().disable().formLogin()
                .loginPage("/login")
                .failureHandler((request,response,exception)->{
                    System.out.println(exception.getMessage());
                    String redirectUrl = new String();
                    if(exception.getMessage()=="User is disabled"){
                        redirectUrl = request.getContextPath() + "/login?error=notactive";
                    }else if (exception.getMessage()=="Bad credentials"){
                        redirectUrl = request.getContextPath() + "/login?error=detailserr";
                    }if (request.getParameter("username").equals("")|| request.getParameter("password").equals("")) {
                    }
                    response.sendRedirect(redirectUrl);

                })

                .defaultSuccessUrl("/mainwindow", true)
                .usernameParameter("username")
                .passwordParameter("password")
                .and().logout()
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login").and().exceptionHandling().accessDeniedPage("/access-denied").and()
                .sessionManagement()
                .invalidSessionUrl("/login")
                .sessionFixation()
                .changeSessionId()
                .maximumSessions(50)
                .expiredUrl("/login");
    }
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        return bCryptPasswordEncoder;
    }
}